import { describe, expect, it } from "vitest";

import {
  formatDietTagsForDb,
  parseDietTagsFromDb,
} from "@/lib/recipes/recipe-filter-constants";

describe("formatDietTagsForDb / parseDietTagsFromDb", () => {
  it("formats and parses diet tags consistently", () => {
    const csv = formatDietTagsForDb(["VEGANO", "SIN_GLUTEN"]);
    expect(csv).toBe(",VEGANO,SIN_GLUTEN,");
    expect(parseDietTagsFromDb(csv)).toEqual(["VEGANO", "SIN_GLUTEN"]);
  });

  it("returns null / [] for empty input", () => {
    expect(formatDietTagsForDb(undefined)).toBeNull();
    expect(formatDietTagsForDb([])).toBeNull();
    expect(parseDietTagsFromDb(null)).toEqual([]);
    expect(parseDietTagsFromDb("")).toEqual([]);
  });

  it("deduplicates tags when formatting", () => {
    expect(formatDietTagsForDb(["KETO", "keto "])).toBe(",KETO,");
  });
});
