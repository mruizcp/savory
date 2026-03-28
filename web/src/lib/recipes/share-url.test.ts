import { afterEach, describe, expect, it } from "vitest";

import {
  absoluteShareUrl,
  buildSharePath,
} from "@/lib/recipes/share-url";

describe("buildSharePath", () => {
  it("builds public share path from token", () => {
    expect(buildSharePath("abc123")).toBe("/compartir/abc123");
  });
});

describe("absoluteShareUrl", () => {
  const authPrev = process.env.AUTH_URL;
  const publicPrev = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    if (authPrev === undefined) delete process.env.AUTH_URL;
    else process.env.AUTH_URL = authPrev;
    if (publicPrev === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = publicPrev;
  });

  it("uses request origin when provided", () => {
    expect(absoluteShareUrl("tok", "https://app.example.com")).toBe(
      "https://app.example.com/compartir/tok",
    );
    expect(absoluteShareUrl("tok", "https://app.example.com/")).toBe(
      "https://app.example.com/compartir/tok",
    );
  });

  it("falls back to AUTH_URL then NEXT_PUBLIC_APP_URL", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.AUTH_URL = "https://auth.test";
    expect(absoluteShareUrl("x", null)).toBe("https://auth.test/compartir/x");

    delete process.env.AUTH_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://public.test/";
    expect(absoluteShareUrl("y", null)).toBe("https://public.test/compartir/y");
  });

  it("returns relative path when no base is configured", () => {
    delete process.env.AUTH_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(absoluteShareUrl("z", null)).toBe("/compartir/z");
  });
});
