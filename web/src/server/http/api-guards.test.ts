import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/server/env/is-database-configured", () => ({
  isDatabaseConfigured: vi.fn(),
}));

import { auth } from "@/auth";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";
import { requireAuth, requireDatabase } from "@/server/http/api-guards";

describe("requireAuth", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("returns 401 when session has no userId", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { name: "x" } } as never);
    const out = await requireAuth("Debes iniciar sesión.");
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.response.status).toBe(401);
      const body = await out.response.json();
      expect(body).toEqual({ error: "Debes iniciar sesión." });
    }
  });

  it("returns success when userId is present", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "Nombre" },
    } as never);
    const out = await requireAuth("msg");
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.userId).toBe("user-1");
  });
});

describe("requireDatabase", () => {
  beforeEach(() => {
    vi.mocked(isDatabaseConfigured).mockReset();
  });

  it("returns 503 response when database is not configured", () => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);
    const out = requireDatabase("Falta DATABASE_URL");
    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.response).toBeInstanceOf(NextResponse);
      expect(out.response.status).toBe(503);
    }
  });

  it("returns ok when database is configured", () => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    expect(requireDatabase("msg")).toEqual({ ok: true });
  });
});
