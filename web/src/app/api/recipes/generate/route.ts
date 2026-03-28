import { NextResponse } from "next/server";
import { z } from "zod";

import { RECIPE_PROMPT_VERSION } from "@/lib/ai/recipe-prompt";
import { generateRecipeStructured } from "@/lib/ai/generate-recipe";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";
import { requireAuth, requireDatabase } from "@/server/http/api-guards";
import { mapDbRecipeToGenerationOutput } from "@/server/recipes/map-db-recipe-to-output";
import {
  persistGeneratedRecipe,
  persistGenerationFailure,
} from "@/server/recipes/persist-generated-recipe";
import { getProfileOrDefault } from "@/server/profile/service";
import { ensureUserForAuth } from "@/server/users/ensure-user";
import { prisma } from "@/server/db/prisma";

const bodySchema = z.object({
  ingredients: z.array(z.string()).min(1).max(50),
  generationType: z.enum(["WITH_AVAILABLE", "WITH_MISSING"]),
  parentRecipeId: z.string().min(1).max(128).optional().nullable(),
  regenerateHint: z.string().max(500).optional().nullable(),
});

function normalizeIngredients(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of raw) {
    const t = s.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

export async function POST(request: Request) {
  const authResult = await requireAuth(
    "Debes iniciar sesión para generar recetas.",
  );
  if (!authResult.ok) return authResult.response;
  const { session, userId } = authResult;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la petición no válido." },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos. Revisa ingredientes y opciones." },
      { status: 400 },
    );
  }

  const ingredients = normalizeIngredients(parsed.data.ingredients);
  if (ingredients.length === 0) {
    return NextResponse.json(
      { error: "Indica al menos un ingrediente." },
      { status: 400 },
    );
  }

  const { generationType, parentRecipeId, regenerateHint } = parsed.data;

  try {
    let parentRecipe = null;
    if (parentRecipeId) {
      const dbForRegenerate = requireDatabase(
        "Regenerar requiere base de datos configurada (DATABASE_URL).",
        400,
      );
      if (!dbForRegenerate.ok) return dbForRegenerate.response;
      const parent = await prisma.recipe.findFirst({
        where: { id: parentRecipeId, userId },
        include: {
          steps: { orderBy: { stepNumber: "asc" } },
          ingredients: true,
        },
      });
      if (!parent) {
        return NextResponse.json(
          { error: "No se encontró la receta anterior para regenerar." },
          { status: 404 },
        );
      }
      parentRecipe = mapDbRecipeToGenerationOutput(parent);
    }

    const profile = await getProfileOrDefault(userId);

    const result = await generateRecipeStructured({
      ingredients,
      generationType,
      parentRecipe,
      regenerateHint: regenerateHint ?? null,
      profile,
    });

    if (isDatabaseConfigured()) {
      await ensureUserForAuth({
        userId: userId,
        email: session.user?.email,
        displayName: session.user?.name,
      });
    }

    const persisted = await persistGeneratedRecipe({
      userId,
      recipe: result.recipe,
      generationType,
      aiModel: result.model,
      promptVersion: result.promptVersion,
      parentRecipeId: parentRecipeId ?? null,
    });

    return NextResponse.json({
      recipe: result.recipe,
      recipeId: persisted?.recipeId ?? null,
      persisted: Boolean(persisted),
      model: result.model,
      promptVersion: result.promptVersion,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al generar la receta.";
    if (isDatabaseConfigured()) {
      try {
        await ensureUserForAuth({
          userId: userId,
          email: session.user?.email,
          displayName: session.user?.name,
        });
        await persistGenerationFailure({
          userId,
          promptVersion: RECIPE_PROMPT_VERSION,
          errorMessage: message,
        });
      } catch {
        // Ignorar fallos de auditoría si la base no está disponible.
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
