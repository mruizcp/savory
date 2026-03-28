/** Resumen para listado / búsqueda de recetas guardadas del usuario. */
export type RecipeSearchSummary = {
  id: string;
  title: string;
  description: string | null;
  totalMinutes: number | null;
  difficulty: string | null;
  mealType: string | null;
  dietTagsCsv: string | null;
  createdAt: string;
  updatedAt: string;
  /** Si la receta está en favoritos del usuario actual. */
  isFavorite: boolean;
};
