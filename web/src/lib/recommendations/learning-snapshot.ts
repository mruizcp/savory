/** Versión del payload persistido en `UserLearningAggregate` (evolucionar sin romper lectores). */
export const USER_LEARNING_PAYLOAD_VERSION = 1;

/** Versión de la tabla de pesos `LEARNING_WEIGHTS` (cambiar si se alteran los pesos). */
export const LEARNING_WEIGHTS_VERSION = 1;

/** Pesos para combinar fuentes (v1). Ajustar aquí para “aprendizaje” más agresivo o conservador. */
export const LEARNING_WEIGHTS = {
  /** Por ingrediente en una receta marcada como favorita */
  favoriteIngredient: 3,
  /** Por ingrediente en una receta que el usuario corrigió y guardó */
  correctedRecipeIngredient: 2.75,
  /** Ingredientes en metadata de historial (sesiones manuales/foto) */
  historyPreviewIngredient: 1,
  /** Mención ligera en resumen de historial de receta */
  historyRecipeTitleHint: 0.35,
} as const;

/** Formato almacenado en BD (compacto, truncado si hace falta). */
export type UserLearningPersistedPayloadV1 = {
  v: typeof USER_LEARNING_PAYLOAD_VERSION;
  /** Alineado con constantes `LEARNING_WEIGHTS` en código. */
  weightsVersion: number;
  computedAt: string;
  topIngredientScores: Array<{ name: string; score: number }>;
  recentRecipeHints: string[];
  dislikedIngredients: string[];
  dietaryRestrictions: string[];
  cookingGoals: string[];
  cookingLevel: string | null;
  behavior: {
    recipeEventsLast14d: number;
    ingredientSessionEventsLast14d: number;
    correctedEventsLast14d: number;
    favoritesConsidered: number;
    correctedRecipesLoaded: number;
  };
};

export function compactPayloadForDb(
  payload: UserLearningPersistedPayloadV1,
  maxLen = 3950,
): string {
  const slim: UserLearningPersistedPayloadV1 = {
    ...payload,
    topIngredientScores: payload.topIngredientScores.slice(0, 18),
    recentRecipeHints: payload.recentRecipeHints.slice(0, 10),
  };
  let s = JSON.stringify(slim);
  if (s.length <= maxLen) return s;
  slim.topIngredientScores = slim.topIngredientScores.slice(0, 10);
  slim.recentRecipeHints = slim.recentRecipeHints.slice(0, 6);
  s = JSON.stringify(slim);
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1) + "…";
}
