import { NextResponse } from "next/server";
import { z } from "zod";

import { RECIPE_PROMPT_VERSION } from "@/lib/ai/recipe-prompt";
import { generateRecipeStructured } from "@/lib/ai/generate-recipe";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";
import { requireAuth } from "@/server/http/api-guards";
import {
  persistGeneratedRecipe,
  persistGenerationFailure,
} from "@/server/recipes/persist-generated-recipe";
import { getProfileOrDefault } from "@/server/profile/service";
import { ensureUserForAuth } from "@/server/users/ensure-user";

const bodySchema = z.object({
  ingredients: z.array(z.string()).min(1).max(50),
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
      { error: "Datos inválidos. Revisa ingredientes." },
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

  try {
    const profile = await getProfileOrDefault(userId);

    const [availableResult, missingResult] = await Promise.all([
      generateRecipeStructured({
        ingredients,
        generationType: "WITH_AVAILABLE",
        parentRecipe: null,
        regenerateHint: null,
        profile,
      }),
      generateRecipeStructured({
        ingredients,
        generationType: "WITH_MISSING",
        parentRecipe: null,
        regenerateHint: null,
        profile,
      }),
    ]);

    if (isDatabaseConfigured()) {
      await ensureUserForAuth({
        userId: userId,
        email: session.user?.email,
        displayName: session.user?.name,
      });
    }

    const persistedAvailable = await persistGeneratedRecipe({
      userId,
      recipe: availableResult.recipe,
      generationType: "WITH_AVAILABLE",
      aiModel: availableResult.model,
      promptVersion: availableResult.promptVersion,
      parentRecipeId: null,
    });

    const persistedMissing = await persistGeneratedRecipe({
      userId,
      recipe: missingResult.recipe,
      generationType: "WITH_MISSING",
      aiModel: missingResult.model,
      promptVersion: missingResult.promptVersion,
      parentRecipeId: null,
    });

    return NextResponse.json({
      WITH_AVAILABLE: {
        recipe: availableResult.recipe,
        recipeId: persistedAvailable?.recipeId ?? null,
      },
      WITH_MISSING: {
        recipe: missingResult.recipe,
        recipeId: persistedMissing?.recipeId ?? null,
      },
      persisted:
        Boolean(persistedAvailable) && Boolean(persistedMissing),
      model: availableResult.model,
      promptVersion: RECIPE_PROMPT_VERSION,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al generar las recetas.";
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
        // Ignorar fallos de auditoría.
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
