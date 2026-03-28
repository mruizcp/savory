import "server-only";

import { randomBytes } from "node:crypto";

import { recipeDifficultySchema } from "@/lib/ai/recipe-schema";
import type { RecipeDetailPayload } from "@/lib/recipes/recipe-detail-payload";
import { defaultBaseServings } from "@/lib/recipes/portion-scale";
import {
  absoluteShareUrl,
  buildSharePath,
} from "@/lib/recipes/share-url";
import { logHistoryEvent } from "@/server/history/log-history-event";
import { prisma } from "@/server/db/prisma";

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function splitUtensils(utensilsText: string | null): string[] {
  if (!utensilsText?.trim()) return [];
  return utensilsText
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function newShareToken(): string {
  return randomBytes(32).toString("hex");
}

export { absoluteShareUrl, buildSharePath };

function mapRecipeToPayload(recipe: {
  id: string;
  title: string;
  description: string | null;
  notes: string | null;
  basedOnRecipeId: string | null;
  servings: number | null;
  totalMinutes: number | null;
  calories: number | null;
  difficulty: string | null;
  utensilsText: string | null;
  ingredients: Array<{
    id: string;
    ingredientName: string;
    quantityText: string | null;
    isMissing: boolean;
  }>;
  steps: Array<{ stepNumber: number; instruction: string }>;
}): RecipeDetailPayload {
  const difficultyParsed = recipe.difficulty
    ? recipeDifficultySchema.safeParse(recipe.difficulty)
    : null;

  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    notes: recipe.notes ?? null,
    basedOnRecipeId: recipe.basedOnRecipeId ?? null,
    baseServings: defaultBaseServings(recipe.servings),
    totalMinutes: recipe.totalMinutes,
    calories: recipe.calories,
    difficulty:
      difficultyParsed?.success === true ? difficultyParsed.data : null,
    utensils: splitUtensils(recipe.utensilsText),
    ingredients: recipe.ingredients.map((ing) => ({
      id: ing.id,
      name: ing.ingredientName,
      quantityText: ing.quantityText,
      isMissing: ing.isMissing,
    })),
    steps: recipe.steps.map((s) => ({
      stepNumber: s.stepNumber,
      instruction: s.instruction,
    })),
  };
}

export async function getRecipeDetailByShareToken(
  token: string,
): Promise<RecipeDetailPayload | null> {
  if (!hasDatabaseUrl() || !token.trim()) return null;

  const recipe = await prisma.recipe.findFirst({
    where: { shareToken: token.trim() },
    include: {
      steps: { orderBy: { stepNumber: "asc" } },
      ingredients: true,
    },
  });

  if (!recipe) return null;

  return mapRecipeToPayload(recipe);
}

export async function getShareStatusForOwner(params: {
  userId: string;
  recipeId: string;
}): Promise<{ active: boolean; token: string | null } | null> {
  if (!hasDatabaseUrl()) return null;

  const recipe = await prisma.recipe.findFirst({
    where: { id: params.recipeId, userId: params.userId },
    select: { shareToken: true },
  });
  if (!recipe) return null;

  return {
    active: Boolean(recipe.shareToken),
    token: recipe.shareToken,
  };
}

export async function generateOrRotateShareToken(params: {
  userId: string;
  recipeId: string;
  requestOrigin: string | null;
}): Promise<{ token: string; shareUrl: string } | null> {
  if (!hasDatabaseUrl()) return null;

  const recipe = await prisma.recipe.findFirst({
    where: { id: params.recipeId, userId: params.userId },
    select: { id: true, title: true },
  });
  if (!recipe) return null;

  const token = newShareToken();

  await prisma.recipe.update({
    where: { id: params.recipeId },
    data: { shareToken: token },
  });

  const shareUrl = absoluteShareUrl(token, params.requestOrigin);

  await logHistoryEvent({
    userId: params.userId,
    entityType: "RECIPE",
    entityId: params.recipeId,
    actionType: "SHARED",
    summary: `Enlace público generado o renovado: ${recipe.title}`,
    metadata: {
      recipeId: params.recipeId,
      sharePath: buildSharePath(token),
    },
  });

  return { token, shareUrl };
}

export async function revokeShareToken(params: {
  userId: string;
  recipeId: string;
}): Promise<boolean> {
  if (!hasDatabaseUrl()) return false;

  const recipe = await prisma.recipe.findFirst({
    where: { id: params.recipeId, userId: params.userId },
    select: { id: true, title: true, shareToken: true },
  });
  if (!recipe || !recipe.shareToken) return false;

  await prisma.recipe.update({
    where: { id: params.recipeId },
    data: { shareToken: null },
  });

  await logHistoryEvent({
    userId: params.userId,
    entityType: "RECIPE",
    entityId: params.recipeId,
    actionType: "UPDATED",
    summary: `Enlace público revocado: ${recipe.title}`,
    metadata: { recipeId: params.recipeId, action: "SHARE_REVOKED" },
  });

  return true;
}
