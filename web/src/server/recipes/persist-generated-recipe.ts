import "server-only";

import { randomUUID } from "node:crypto";

import type { RecipeGenerationOutput } from "@/lib/ai/recipe-schema";
import { formatDietTagsForDb } from "@/lib/recipes/recipe-filter-constants";
import { logHistoryEvent } from "@/server/history/log-history-event";
import { prisma } from "@/server/db/prisma";

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

export type PersistGeneratedRecipeParams = {
  userId: string;
  recipe: RecipeGenerationOutput;
  generationType: "WITH_AVAILABLE" | "WITH_MISSING";
  aiModel: string;
  promptVersion: string;
  parentRecipeId?: string | null;
};

export type PersistGeneratedRecipeResult = {
  recipeId: string;
};

/**
 * Persiste receta generada + pasos + ingredientes + intento de generación + evento de historial.
 */
export async function persistGeneratedRecipe(
  params: PersistGeneratedRecipeParams,
): Promise<PersistGeneratedRecipeResult | null> {
  if (!hasDatabaseUrl()) return null;

  const id = randomUUID();
  const utensilsText =
    params.recipe.utensils.length > 0
      ? truncate(params.recipe.utensils.join(", "), 1000)
      : null;

  await prisma.$transaction(async (tx) => {
    await tx.recipe.create({
      data: {
        id,
        userId: params.userId,
        title: truncate(params.recipe.title, 180),
        description: params.recipe.description
          ? truncate(params.recipe.description, 2000)
          : null,
        sourceType: "GENERATED",
        generationType: params.generationType,
        servings: params.recipe.servings ?? null,
        totalMinutes: params.recipe.totalMinutes ?? null,
        calories: params.recipe.calories ?? null,
        difficulty: params.recipe.difficulty ?? null,
        mealType: params.recipe.mealType ?? null,
        dietTagsCsv: formatDietTagsForDb(params.recipe.dietTags),
        utensilsText,
        aiProvider: "openai",
        aiModel: truncate(params.aiModel, 120),
        parentRecipeId: params.parentRecipeId ?? null,
        steps: {
          create: params.recipe.steps.map((s) => ({
            id: randomUUID(),
            stepNumber: s.stepNumber,
            instruction: truncate(s.instruction, 2000),
          })),
        },
        ingredients: {
          create: params.recipe.ingredients.map((ing) => ({
            id: randomUUID(),
            ingredientName: truncate(ing.name, 120),
            quantityText: ing.quantityText
              ? truncate(ing.quantityText, 64)
              : null,
            isMissing: ing.isMissing,
          })),
        },
      },
    });

    await tx.recipeGenerationAttempt.create({
      data: {
        id: randomUUID(),
        userId: params.userId,
        recipeId: id,
        ingredientSessionId: null,
        promptVersion: truncate(params.promptVersion, 64),
        status: "SUCCESS",
        errorMessage: null,
      },
    });

    await tx.historyEvent.create({
      data: {
        id: randomUUID(),
        userId: params.userId,
        entityType: "RECIPE",
        entityId: id,
        actionType: params.parentRecipeId ? "REGENERATED" : "CREATED",
        summary: truncate(
          params.parentRecipeId
            ? `Receta regenerada: ${params.recipe.title}`
            : `Receta generada: ${params.recipe.title}`,
          400,
        ),
        metadataText: null,
      },
    });
  });

  return { recipeId: id };
}

export async function persistGenerationFailure(params: {
  userId: string;
  promptVersion: string;
  errorMessage: string;
}): Promise<void> {
  if (!hasDatabaseUrl()) return;

  await prisma.recipeGenerationAttempt.create({
    data: {
      id: randomUUID(),
      userId: params.userId,
      recipeId: null,
      ingredientSessionId: null,
      promptVersion: truncate(params.promptVersion, 64),
      status: "ERROR",
      errorMessage: truncate(params.errorMessage, 2000),
    },
  });

  await logHistoryEvent({
    userId: params.userId,
    entityType: "RECIPE",
    entityId: null,
    actionType: "FAILED",
    summary: truncate(`Error al generar receta: ${params.errorMessage}`, 400),
    metadata: {
      promptVersion: params.promptVersion,
      errorMessage: truncate(params.errorMessage, 500),
    },
  });
}
