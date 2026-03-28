import { NextResponse } from "next/server";

import { listFavoriteRecipes } from "@/server/collections/favorites";
import { requireAuth } from "@/server/http/api-guards";

export async function GET() {
  const authResult = await requireAuth("No autorizado.");
  if (!authResult.ok) return authResult.response;

  const items = await listFavoriteRecipes({ userId: authResult.userId });
  return NextResponse.json({ items });
}
