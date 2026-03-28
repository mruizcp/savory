import { NextResponse } from "next/server";
import { z } from "zod";

import { parseRecipeSearchFiltersFromParams } from "@/lib/recipes/parse-recipe-search-filters";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";
import { requireAuth } from "@/server/http/api-guards";
import { searchRecipesForUser } from "@/server/recipes/search-recipes-for-user";

const limitSchema = z.coerce.number().int().min(1).max(50);

export async function GET(request: Request) {
  const authResult = await requireAuth(
    "Debes iniciar sesión para buscar recetas.",
  );
  if (!authResult.ok) return authResult.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limitRaw = searchParams.get("limit");
  let limit = 30;
  if (limitRaw) {
    const parsed = limitSchema.safeParse(limitRaw);
    if (parsed.success) limit = parsed.data;
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      recipes: [],
      persistenceAvailable: false,
    });
  }

  const filters = parseRecipeSearchFiltersFromParams(searchParams);

  const recipes = await searchRecipesForUser({
    userId: authResult.userId,
    query: q,
    limit,
    filters,
  });

  return NextResponse.json({
    recipes,
    persistenceAvailable: true,
  });
}
