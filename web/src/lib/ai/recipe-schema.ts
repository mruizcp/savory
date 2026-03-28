import { z } from "zod";

import {
  RECIPE_DIET_TAGS,
  RECIPE_MEAL_TYPES,
} from "@/lib/recipes/recipe-filter-constants";

/** Coincide con canvas: pasos, tiempo, calorías, dificultad, utensilios, porciones; ingredientes con disponibles/faltantes. */
export const recipeDifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

const mealTypeCodes = RECIPE_MEAL_TYPES.map((m) => m.code) as [
  string,
  ...string[],
];
const dietTagCodes = RECIPE_DIET_TAGS.map((m) => m.code) as [string, ...string[]];

export const recipeMealTypeSchema = z.enum(mealTypeCodes);
export const recipeDietTagSchema = z.enum(dietTagCodes);

export const recipeIngredientSchema = z.object({
  name: z.string().min(1).max(120),
  quantityText: z.string().max(64).nullable().optional(),
  isMissing: z.boolean(),
});

export const recipeStepSchema = z.object({
  stepNumber: z.number().int().min(1),
  instruction: z.string().min(1).max(2000),
});

export const recipeGenerationOutputSchema = z.object({
  title: z.string().min(1).max(180),
  description: z.string().max(2000).nullable().optional(),
  servings: z.number().int().min(1).max(50).nullable().optional(),
  totalMinutes: z.number().int().min(1).max(24 * 60).nullable().optional(),
  calories: z.number().int().min(0).max(20000).nullable().optional(),
  difficulty: recipeDifficultySchema.nullable().optional(),
  /** Clasificación para filtros / explorar (opcional). */
  mealType: recipeMealTypeSchema.nullable().optional(),
  /** Etiquetas alineadas con restricciones frecuentes (opcional). */
  dietTags: z.preprocess(
    (val) => (val == null ? undefined : val),
    z.array(recipeDietTagSchema).max(5).optional(),
  ),
  utensils: z.array(z.string().max(80)).max(20),
  ingredients: z.array(recipeIngredientSchema).min(1).max(40),
  steps: z.array(recipeStepSchema).min(1).max(40),
});

export type RecipeGenerationOutput = z.infer<typeof recipeGenerationOutputSchema>;
