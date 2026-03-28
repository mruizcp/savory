import { describe, expect, it } from "vitest";

import { parseRecipeSearchFiltersFromParams } from "@/lib/recipes/parse-recipe-search-filters";

describe("parseRecipeSearchFiltersFromParams", () => {
  it("returns undefined when no supported filters present", () => {
    const p = new URLSearchParams();
    expect(parseRecipeSearchFiltersFromParams(p)).toBeUndefined();
  });

  it("parses difficulty when valid", () => {
    const p = new URLSearchParams({ difficulty: "EASY" });
    expect(parseRecipeSearchFiltersFromParams(p)).toEqual({
      difficulty: "EASY",
    });
  });

  it("ignores invalid difficulty", () => {
    const p = new URLSearchParams({ difficulty: "SUPER_HARD" });
    expect(parseRecipeSearchFiltersFromParams(p)).toBeUndefined();
  });

  it("parses maxMinutes in allowed range", () => {
    const p = new URLSearchParams({ maxMinutes: "45" });
    expect(parseRecipeSearchFiltersFromParams(p)).toEqual({
      maxMinutes: 45,
    });
  });

  it("ignores maxMinutes outside range", () => {
    const p = new URLSearchParams({ maxMinutes: "10" });
    expect(parseRecipeSearchFiltersFromParams(p)).toBeUndefined();
  });

  it("parses mealType and dietTag when codes are known", () => {
    const p = new URLSearchParams({
      mealType: "CENA",
      dietTag: "VEGANO",
    });
    expect(parseRecipeSearchFiltersFromParams(p)).toEqual({
      mealType: "CENA",
      dietTag: "VEGANO",
    });
  });

  it("ignores unknown mealType or dietTag", () => {
    const p = new URLSearchParams({ mealType: "BOCADILLO", dietTag: "X" });
    expect(parseRecipeSearchFiltersFromParams(p)).toBeUndefined();
  });
});
