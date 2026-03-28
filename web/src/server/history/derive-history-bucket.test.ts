import { describe, expect, it } from "vitest";

import {
  deriveHistoryBucket,
  parseHistoryMetadata,
} from "@/server/history/derive-history-bucket";

describe("parseHistoryMetadata", () => {
  it("returns null for empty input", () => {
    expect(parseHistoryMetadata(null)).toBeNull();
    expect(parseHistoryMetadata("")).toBeNull();
  });

  it("parses valid JSON object", () => {
    expect(parseHistoryMetadata('{"preview":["a","b"]}')).toEqual({
      preview: ["a", "b"],
    });
  });

  it("returns null for invalid JSON or non-object", () => {
    expect(parseHistoryMetadata("{")).toBeNull();
    expect(parseHistoryMetadata("[]")).toBeNull();
    expect(parseHistoryMetadata('"x"')).toBeNull();
  });
});

describe("deriveHistoryBucket", () => {
  it("classifies PROFILE as change", () => {
    expect(deriveHistoryBucket("PROFILE", "UPDATED", null)).toBe("change");
  });

  it("classifies INGREDIENTS with PHOTO source as photo", () => {
    expect(
      deriveHistoryBucket("INGREDIENTS", "CREATED", { sourceType: "PHOTO" }),
    ).toBe("photo");
  });

  it("classifies INGREDIENTS otherwise as ingredient", () => {
    expect(deriveHistoryBucket("INGREDIENTS", "CREATED", {})).toBe(
      "ingredient",
    );
  });

  it("classifies RECIPE CORRECTED as recipe", () => {
    expect(deriveHistoryBucket("RECIPE", "CORRECTED", null)).toBe("recipe");
  });

  it("classifies FAVORITE as collection", () => {
    expect(deriveHistoryBucket("FAVORITE", "CREATED", null)).toBe(
      "collection",
    );
  });
});
