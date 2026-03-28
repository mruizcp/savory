import { afterEach, describe, expect, it } from "vitest";

import { isDatabaseConfigured } from "@/server/env/is-database-configured";

describe("isDatabaseConfigured", () => {
  const prev = process.env.DATABASE_URL;

  afterEach(() => {
    if (prev === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = prev;
  });

  it("returns false when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;
    expect(isDatabaseConfigured()).toBe(false);
  });

  it("returns false when DATABASE_URL is empty or whitespace", () => {
    process.env.DATABASE_URL = "   ";
    expect(isDatabaseConfigured()).toBe(false);
  });

  it("returns true when DATABASE_URL has a value", () => {
    process.env.DATABASE_URL = "sqlserver://localhost";
    expect(isDatabaseConfigured()).toBe(true);
  });
});
