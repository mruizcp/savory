import "server-only";

import { recipeDifficultySchema } from "@/lib/ai/recipe-schema";
import type { RecipeDetailPayload } from "@/lib/recipes/recipe-detail-payload";
import { defaultBaseServings } from "@/lib/recipes/portion-scale";
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

export async function getRecipeDetailForUser(params: {
  recipeId: string;
  userId: string;
}): Promise<RecipeDetailPayload | null> {
  if (!hasDatabaseUrl()) return null;

  const recipe = await prisma.recipe.findFirst({
    where: { id: params.recipeId, userId: params.userId },
    include: {
      steps: { orderBy: { stepNumber: "asc" } },
      ingredients: true,
    },
  });

  if (!recipe) return null;

  const favorite = await prisma.recipeFavorite.findUnique({
    where: {
      userId_recipeId: { userId: params.userId, recipeId: recipe.id },
    },
    select: { id: true },
  });

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
    isFavorite: Boolean(favorite),
  };
}
