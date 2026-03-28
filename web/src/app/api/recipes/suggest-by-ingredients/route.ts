import { NextResponse } from "next/server";
import { z } from "zod";

import { isDatabaseConfigured } from "@/server/env/is-database-configured";
import { requireAuth } from "@/server/http/api-guards";
import { suggestRecipesForPantry } from "@/server/recipes/suggest-recipes-for-pantry";

const bodySchema = z.object({
  ingredients: z.array(z.string()).min(1).max(80),
});

export async function POST(request: Request) {
  const authResult = await requireAuth(
    "Inicia sesión para ver ideas con tus recetas guardadas.",
  );
  if (!authResult.ok) return authResult.response;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      recipes: [],
      persistenceAvailable: false,
    });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Indica al menos un ingrediente." },
      { status: 400 },
    );
  }

  const { recipes, matchMode } = await suggestRecipesForPantry({
    userId: authResult.userId,
    pantryIngredientNames: parsed.data.ingredients,
    limit: 12,
  });

  return NextResponse.json({
    recipes,
    matchMode,
    persistenceAvailable: true,
  });
}
