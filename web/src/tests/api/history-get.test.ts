import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const mockRequireAuth = vi.fn();
const mockIsDb = vi.fn();
const mockGetHistory = vi.fn();

vi.mock("@/server/http/api-guards", () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
}));

vi.mock("@/server/env/is-database-configured", () => ({
  isDatabaseConfigured: () => mockIsDb(),
}));

vi.mock("@/server/history/get-history-for-user", () => ({
  getHistoryForUser: (...args: unknown[]) => mockGetHistory(...args),
}));

import { GET } from "@/app/api/history/route";

describe("GET /api/history", () => {
  beforeEach(() => {
    mockRequireAuth.mockReset();
    mockIsDb.mockReset();
    mockGetHistory.mockReset();
  });

  it("returns 401 when requireAuth fails", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "No auth" }, { status: 401 }),
    });
    const res = await GET(new Request("http://localhost/api/history"));
    expect(res.status).toBe(401);
    expect(mockGetHistory).not.toHaveBeenCalled();
  });

  it("returns empty entries when persistence is off", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: true,
      userId: "u1",
      session: {} as never,
    });
    mockIsDb.mockReturnValue(false);
    const res = await GET(new Request("http://localhost/api/history"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      entries: [],
      persistenceAvailable: false,
    });
    expect(mockGetHistory).not.toHaveBeenCalled();
  });

  it("loads history when persistence is on", async () => {
    mockRequireAuth.mockResolvedValue({
      ok: true,
      userId: "u1",
      session: {} as never,
    });
    mockIsDb.mockReturnValue(true);
    mockGetHistory.mockResolvedValue([{ id: "e1" }]);
    const res = await GET(new Request("http://localhost/api/history?limit=20"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.persistenceAvailable).toBe(true);
    expect(body.entries).toEqual([{ id: "e1" }]);
    expect(mockGetHistory).toHaveBeenCalledWith({ userId: "u1", limit: 20 });
  });
});
