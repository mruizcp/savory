import "server-only";

import { randomUUID } from "node:crypto";

import { logHistoryEvent } from "@/server/history/log-history-event";
import { prisma } from "@/server/db/prisma";

function truncate(text: string, max: number): string {
  if (text.length > max) return text.slice(0, max - 1) + "…";
  return text;
}

export type RecipeCorrectionIngredient = {
  name: string;
  quantityText: string | null;
  isMissing: boolean;
};

export type RecipeCorrectionStep = {
  stepNumber: number;
  instruction: string;
};

export type RecipeCorrectionPayload = {
  title: string;
  description: string | null;
  servings: number;
  totalMinutes: number | null;
  calories: number | null;
  difficulty: "EASY" | "MEDIUM" | "HARD" | null;
  notes: string | null;
  utensils: string[];
  ingredients: RecipeCorrectionIngredient[];
  steps: RecipeCorrectionStep[];
};

/**
 * Crea una nueva fila Recipe (versión corregida). La receta `sourceRecipeId` no se modifica.
 */
export async function persistRecipeCorrection(params: {
  userId: string;
  sourceRecipeId: string;
  draft: RecipeCorrectionPayload;
}): Promise<{ recipeId: string } | null> {
  if (!process.env.DATABASE_URL?.trim()) return null;

  const source = await prisma.recipe.findFirst({
    where: { id: params.sourceRecipeId, userId: params.userId },
    select: {
      id: true,
      generationType: true,
      mealType: true,
      dietTagsCsv: true,
      aiProvider: true,
      aiModel: true,
    },
  });

  if (!source) return null;

  const id = randomUUID();
  const utensilsText =
    params.draft.utensils.length > 0
      ? truncate(params.draft.utensils.join(", "), 1000)
      : null;

  const stepsSorted = [...params.draft.steps].sort(
    (a, b) => a.stepNumber - b.stepNumber,
  );
  const stepsRenumbered = stepsSorted.map((s, i) => ({
    ...s,
    stepNumber: i + 1,
  }));

  await prisma.$transaction(async (tx) => {
    await tx.recipe.create({
      data: {
        id,
        userId: params.userId,
        title: truncate(params.draft.title.trim(), 180),
        description: params.draft.description?.trim()
          ? truncate(params.draft.description.trim(), 2000)
          : null,
        sourceType: "CORRECTED",
        generationType: source.generationType,
        servings: params.draft.servings,
        totalMinutes: params.draft.totalMinutes ?? null,
        calories: params.draft.calories ?? null,
        difficulty: params.draft.difficulty ?? null,
        mealType: source.mealType ?? null,
        dietTagsCsv: source.dietTagsCsv ?? null,
        notes: params.draft.notes?.trim()
          ? truncate(params.draft.notes.trim(), 2000)
          : null,
        utensilsText,
        aiProvider: source.aiProvider ?? null,
        aiModel: source.aiModel ? truncate(source.aiModel, 120) : null,
        parentRecipeId: null,
        basedOnRecipeId: source.id,
        shareToken: null,
        steps: {
          create: stepsRenumbered.map((s) => ({
            id: randomUUID(),
            stepNumber: s.stepNumber,
            instruction: truncate(s.instruction.trim(), 2000),
          })),
        },
        ingredients: {
          create: params.draft.ingredients.map((ing) => ({
            id: randomUUID(),
            ingredientName: truncate(ing.name.trim(), 120),
            quantityText: ing.quantityText?.trim()
              ? truncate(ing.quantityText.trim(), 64)
              : null,
            isMissing: ing.isMissing,
          })),
        },
      },
    });
  });

  await logHistoryEvent({
    userId: params.userId,
    entityType: "RECIPE",
    entityId: id,
    actionType: "CORRECTED",
    summary: truncate(`Receta corregida: ${params.draft.title.trim()}`, 400),
    metadata: {
      previousRecipeId: source.id,
      title: truncate(params.draft.title.trim(), 180),
    },
  });

  return { recipeId: id };
}
