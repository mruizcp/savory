/**
 * OpenAI and vision helpers (server-side) will be implemented here.
 */

export { detectIngredientsFromImage } from "@/lib/ai/ingredient-vision";
export { generateRecipeStructured } from "@/lib/ai/generate-recipe";
export type { GenerateRecipeResult } from "@/lib/ai/generate-recipe";
export {
  RECIPE_PROMPT_VERSION,
  RECIPE_SYSTEM_PROMPT,
  buildUserRecipePrompt,
  buildRecipeJsonSchemaDescription,
} from "@/lib/ai/recipe-prompt";
export type { GenerationMode } from "@/lib/ai/recipe-prompt";
export {
  recipeGenerationOutputSchema,
  recipeDifficultySchema,
} from "@/lib/ai/recipe-schema";
export type { RecipeGenerationOutput } from "@/lib/ai/recipe-schema";
