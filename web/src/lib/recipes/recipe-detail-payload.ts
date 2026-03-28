/**
 * Datos serializables para la pantalla de detalle (servidor → cliente).
 */
export type RecipeDetailPayload = {
  id: string;
  title: string;
  description: string | null;
  /** Notas del usuario (versión corregida). */
  notes: string | null;
  /** Receta anterior si esta fila es una corrección manual guardada. */
  basedOnRecipeId: string | null;
  /** Porciones base de la receta (mínimo 1). */
  baseServings: number;
  totalMinutes: number | null;
  calories: number | null;
  difficulty: "EASY" | "MEDIUM" | "HARD" | null;
  utensils: string[];
  ingredients: Array<{
    id: string;
    name: string;
    quantityText: string | null;
    isMissing: boolean;
  }>;
  steps: Array<{ stepNumber: number; instruction: string }>;
  /** Si la receta está en favoritos del usuario actual (solo vista autenticada). */
  isFavorite?: boolean;
};
