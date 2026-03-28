import { NextResponse } from "next/server";

import { getHistoryForUser } from "@/server/history/get-history-for-user";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";
import { requireAuth } from "@/server/http/api-guards";

export async function GET(request: Request) {
  const authResult = await requireAuth(
    "Debes iniciar sesión para ver el historial.",
  );
  if (!authResult.ok) return authResult.response;
  const { userId } = authResult;

  const persistenceAvailable = isDatabaseConfigured();
  if (!persistenceAvailable) {
    return NextResponse.json({
      entries: [],
      persistenceAvailable: false,
    });
  }

  const { searchParams } = new URL(request.url);
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? parseInt(limitRaw, 10) : 50;

  const entries = await getHistoryForUser({
    userId,
    limit: Number.isNaN(limit) ? 50 : limit,
  });

  return NextResponse.json({ entries, persistenceAvailable: true });
}
