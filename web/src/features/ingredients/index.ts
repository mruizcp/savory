/** Ingredientes manual y por foto (con correccion). */
export { INGREDIENT_CATALOG, MAX_SUGGESTIONS } from "@/features/ingredients/constants";
export {
  formatIngredient,
  getIngredientSuggestions,
  includesIngredient,
  isSameIngredient,
} from "@/features/ingredients/utils";
export type { PhotoIngredientsAnalysisResponse } from "@/features/ingredients/types";
