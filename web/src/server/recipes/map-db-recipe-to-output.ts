import "server-only";

import type { Recipe, RecipeIngredient, RecipeStep } from "@prisma/client";

import {
  recipeDifficultySchema,
  recipeDietTagSchema,
  recipeMealTypeSchema,
  type RecipeGenerationOutput,
} from "@/lib/ai/recipe-schema";
import {
  parseDietTagsFromDb,
} from "@/lib/recipes/recipe-filter-constants";

export type RecipeWithStepsAndIngredients = Recipe & {
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];
};

function splitUtensils(utensilsText: string | null): string[] {
  if (!utensilsText?.trim()) return [];
  return utensilsText
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function mapDbRecipeToGenerationOutput(
  recipe: RecipeWithStepsAndIngredients,
): RecipeGenerationOutput {
  const difficultyParsed = recipe.difficulty
    ? recipeDifficultySchema.safeParse(recipe.difficulty)
    : null;

  const steps = [...recipe.steps].sort((a, b) => a.stepNumber - b.stepNumber);

  const mealParsed = recipe.mealType
    ? recipeMealTypeSchema.safeParse(recipe.mealType)
    : null;
  const dietTagsRaw = parseDietTagsFromDb(recipe.dietTagsCsv).filter((t) =>
    recipeDietTagSchema.safeParse(t).success,
  );
  const dietTags =
    dietTagsRaw.length > 0
      ? (dietTagsRaw as NonNullable<RecipeGenerationOutput["dietTags"]>)
      : undefined;

  return {
    title: recipe.title,
    description: recipe.description ?? null,
    servings: recipe.servings ?? null,
    totalMinutes: recipe.totalMinutes ?? null,
    calories: recipe.calories ?? null,
    difficulty:
      difficultyParsed?.success === true ? difficultyParsed.data : null,
    mealType: mealParsed?.success === true ? mealParsed.data : null,
    dietTags,
    utensils: splitUtensils(recipe.utensilsText),
    ingredients: recipe.ingredients.map((ing) => ({
      name: ing.ingredientName,
      quantityText: ing.quantityText ?? null,
      isMissing: ing.isMissing,
    })),
    steps: steps.map((s) => ({
      stepNumber: s.stepNumber,
      instruction: s.instruction,
    })),
  };
}
