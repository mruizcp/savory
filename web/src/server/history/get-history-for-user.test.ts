import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    historyEvent: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/server/db/prisma";
import { getHistoryForUser } from "@/server/history/get-history-for-user";

describe("getHistoryForUser", () => {
  const prevDb = process.env.DATABASE_URL;

  afterEach(() => {
    vi.mocked(prisma.historyEvent.findMany).mockReset();
    if (prevDb === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = prevDb;
  });

  it("returns empty list when DATABASE_URL is not configured", async () => {
    delete process.env.DATABASE_URL;
    const rows = await getHistoryForUser({ userId: "user-1" });
    expect(rows).toEqual([]);
    expect(prisma.historyEvent.findMany).not.toHaveBeenCalled();
  });

  it("queries prisma when database is configured", async () => {
    process.env.DATABASE_URL = "sqlserver://test";
    vi.mocked(prisma.historyEvent.findMany).mockResolvedValue([
      {
        id: "h1",
        createdAt: new Date("2024-06-01T12:00:00Z"),
        userId: "user-1",
        entityType: "RECIPE",
        actionType: "CREATED",
        entityId: "r1",
        summary: "Receta generada: Pollo",
        metadataText: null,
      },
    ] as never);

    const rows = await getHistoryForUser({ userId: "user-1", limit: 10 });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("h1");
    expect(rows[0]?.bucket).toBe("recipe");
    expect(prisma.historyEvent.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  });
});
