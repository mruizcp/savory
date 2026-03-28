import { z } from "zod";

import {
  RECIPE_DIET_TAGS,
  RECIPE_MEAL_TYPES,
} from "@/lib/recipes/recipe-filter-constants";

const difficultyFilter = z.enum(["EASY", "MEDIUM", "HARD"]);

const mealTypeSet = new Set(
  RECIPE_MEAL_TYPES.map((m) => m.code) as string[],
);
const dietTagSet = new Set(
  RECIPE_DIET_TAGS.map((m) => m.code) as string[],
);

export type ParsedRecipeSearchFilters = {
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  maxMinutes?: number;
  mealType?: string;
  dietTag?: string;
};

/**
 * Interpreta query params de `/api/recipes/search` (misma lógica que el route handler).
 */
export function parseRecipeSearchFiltersFromParams(
  searchParams: URLSearchParams,
): ParsedRecipeSearchFilters | undefined {
  const difficultyRaw = searchParams.get("difficulty")?.trim() ?? "";
  const maxRaw = searchParams.get("maxMinutes")?.trim() ?? "";
  const mealRaw = searchParams.get("mealType")?.trim() ?? "";
  const dietRaw = searchParams.get("dietTag")?.trim() ?? "";

  const out: ParsedRecipeSearchFilters = {};

  if (difficultyRaw) {
    const d = difficultyFilter.safeParse(difficultyRaw);
    if (d.success) out.difficulty = d.data;
  }

  if (maxRaw) {
    const n = parseInt(maxRaw, 10);
    if (!Number.isNaN(n) && n >= 15 && n <= 480) out.maxMinutes = n;
  }

  if (mealRaw && mealTypeSet.has(mealRaw)) {
    out.mealType = mealRaw;
  }

  if (dietRaw && dietTagSet.has(dietRaw)) {
    out.dietTag = dietRaw;
  }

  return Object.keys(out).length > 0 ? out : undefined;
}
