import type { Session } from "next-auth";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";

export type AuthSuccess = {
  ok: true;
  session: Session;
  userId: string;
};

export type AuthFailure = {
  ok: false;
  response: NextResponse;
};

export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Exige sesión con `user.id`. Si falta, responde 401 con `{ error: message }`.
 */
export async function requireAuth(message: string): Promise<AuthResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: message }, { status: 401 }),
    };
  }
  return { ok: true, session, userId };
}

export type DatabaseOk = { ok: true };

export type DatabaseFailure = {
  ok: false;
  response: NextResponse;
};

export type DatabaseResult = DatabaseOk | DatabaseFailure;

export function requireDatabase(
  message: string,
  statusWhenMissing: number = 503,
): DatabaseResult {
  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: message },
        { status: statusWhenMissing },
      ),
    };
  }
  return { ok: true };
}
