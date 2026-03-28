import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const mockRequireAuth = vi.fn();
const mockIsDb = vi.fn();
const mockSearch = vi.fn();

vi.mock("@/server/http/api-guards", () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
}));

vi.mock("@/server/env/is-database-configured", () => ({
  isDatabaseConfigured: () => mockIsDb(),
}));

vi.mock("@/server/recipes/search-recipes-for-user", () => ({
  searchRecipesForUser: (...args: unknown[]) => mockSearch(...args),
}));

import { GET } from "@/app/api/recipes/search/route";

describe("GET /api/recipes/search", () => {
  beforeEach(() => {
    mockRequireAuth.mockReset();
    mockIsDb.mockReset();
    mockSearch.mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "No" }, { status: 401 }),
    });
    const res = await GET(
      new Request("http://localhost/api/recipes/search?q=pollo"),
    );
    expect(res.status).toBe(401);
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it("returns empty recipes when database is not configured", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: true,
      userId: "u1",
      session: {} as never,
    });
    mockIsDb.mockReturnValue(false);
    const res = await GET(
      new Request("http://localhost/api/recipes/search?q=x"),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      recipes: [],
      persistenceAvailable: false,
    });
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it("passes query and parsed filters to searchRecipesForUser", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: true,
      userId: "u1",
      session: {} as never,
    });
    mockIsDb.mockReturnValue(true);
    mockSearch.mockResolvedValue([{ id: "r1", title: "T" }]);
    const url =
      "http://localhost/api/recipes/search?q=pollo&difficulty=EASY&maxMinutes=30&mealType=CENA&dietTag=VEGANO&limit=40";
    const res = await GET(new Request(url));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.persistenceAvailable).toBe(true);
    expect(mockSearch).toHaveBeenCalledWith({
      userId: "u1",
      query: "pollo",
      limit: 40,
      filters: {
        difficulty: "EASY",
        maxMinutes: 30,
        mealType: "CENA",
        dietTag: "VEGANO",
      },
    });
  });
});
