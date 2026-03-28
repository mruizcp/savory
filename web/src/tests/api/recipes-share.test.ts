import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuth = vi.fn();
const mockEnsureUser = vi.fn();
const mockGetShareStatus = vi.fn();
const mockGenerateOrRotate = vi.fn();
const mockRevoke = vi.fn();
const mockAbsoluteUrl = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/server/users/ensure-user", () => ({
  ensureUserForAuth: (...a: unknown[]) => mockEnsureUser(...a),
}));

vi.mock("@/server/recipes/share-token", () => ({
  absoluteShareUrl: (t: string, o: string | null) => mockAbsoluteUrl(t, o),
  generateOrRotateShareToken: (...a: unknown[]) => mockGenerateOrRotate(...a),
  getShareStatusForOwner: (...a: unknown[]) => mockGetShareStatus(...a),
  revokeShareToken: (...a: unknown[]) => mockRevoke(...a),
}));

import { DELETE, GET, POST } from "@/app/api/recipes/[recipeId]/share/route";

describe("/api/recipes/[recipeId]/share", () => {
  const prevDb = process.env.DATABASE_URL;
  const ctx = { params: Promise.resolve({ recipeId: "rec-1" }) };

  beforeEach(() => {
    mockAuth.mockReset();
    mockEnsureUser.mockReset();
    mockGetShareStatus.mockReset();
    mockGenerateOrRotate.mockReset();
    mockRevoke.mockReset();
    mockAbsoluteUrl.mockReset();
    if (prevDb === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = prevDb;
  });

  describe("GET", () => {
    it("returns 401 when there is no session", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await GET(
        new Request("http://localhost/api/recipes/rec-1/share"),
        ctx,
      );
      expect(res.status).toBe(401);
      expect(mockGetShareStatus).not.toHaveBeenCalled();
    });

    it("returns inactive share when DATABASE_URL is missing", async () => {
      delete process.env.DATABASE_URL;
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const res = await GET(
        new Request("http://localhost/api/recipes/rec-1/share"),
        ctx,
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        active: false,
        token: null,
        shareUrl: null,
      });
      expect(mockGetShareStatus).not.toHaveBeenCalled();
    });

    it("returns share status and absolute URL when token exists", async () => {
      process.env.DATABASE_URL = "sqlserver://x";
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      mockGetShareStatus.mockResolvedValue({
        active: true,
        token: "tok42",
      });
      mockAbsoluteUrl.mockReturnValue("https://app.test/compartir/tok42");
      const res = await GET(
        new Request("http://localhost/api/recipes/rec-1/share", {
          headers: { host: "app.test" },
        }),
        ctx,
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        active: true,
        token: "tok42",
        shareUrl: "https://app.test/compartir/tok42",
      });
    });
  });

  describe("POST", () => {
    it("returns 503 when DATABASE_URL is missing", async () => {
      delete process.env.DATABASE_URL;
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const res = await POST(
        new Request("http://localhost/api/recipes/rec-1/share"),
        ctx,
      );
      expect(res.status).toBe(503);
      expect(mockEnsureUser).not.toHaveBeenCalled();
    });
  });

  describe("DELETE", () => {
    it("returns 503 when DATABASE_URL is missing", async () => {
      delete process.env.DATABASE_URL;
      mockAuth.mockResolvedValue({ user: { id: "u1" } });
      const res = await DELETE(
        new Request("http://localhost/api/recipes/rec-1/share"),
        ctx,
      );
      expect(res.status).toBe(503);
    });
  });
});
