import "server-only";

import {
  LEARNING_WEIGHTS,
  LEARNING_WEIGHTS_VERSION,
  USER_LEARNING_PAYLOAD_VERSION,
  type UserLearningPersistedPayloadV1,
  compactPayloadForDb,
} from "@/lib/recommendations/learning-snapshot";
import { prisma } from "@/server/db/prisma";
import { getUserProfileByUserId } from "@/server/profile/repository";

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function normalizeToken(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function addWeight(map: Map<string, number>, names: string[], delta: number) {
  for (const raw of names) {
    const n = normalizeToken(raw);
    if (!n) continue;
    map.set(n, (map.get(n) ?? 0) + delta);
  }
}

export type UserSignals = {
  /** Ingredientes ordenados por score descendente (ranking principal). */
  topIngredients: string[];
  /** Score por ingrediente normalizado (para depuración / evolución). */
  ingredientScores: Array<{ name: string; score: number }>;
  recentRecipeHints: string[];
  dislikedIngredients: string[];
  /** Restricciones dietéticas del perfil (texto libre del usuario). */
  dietaryRestrictions: string[];
  /** Objetivos del perfil (salud, rapidez, etc.). */
  cookingGoals: string[];
  cookingLevel: string | null;
  behavior: {
    recipeEventsLast14d: number;
    ingredientSessionEventsLast14d: number;
    correctedEventsLast14d: number;
    favoritesConsidered: number;
    correctedRecipesLoaded: number;
  };
};

const HISTORY_LIMIT = 80;
const FAVORITE_RECIPES_LIMIT = 35;
const CORRECTED_RECIPES_LIMIT = 28;
const DAYS_14 = 14 * 24 * 60 * 60 * 1000;

async function persistSnapshot(
  userId: string,
  payload: UserLearningPersistedPayloadV1,
): Promise<void> {
  try {
    const json = compactPayloadForDb(payload);
    await prisma.userLearningAggregate.upsert({
      where: { userId },
      create: {
        userId,
        payloadJson: json,
        computedAt: new Date(),
      },
      update: {
        payloadJson: json,
        computedAt: new Date(),
      },
    });
  } catch {
    // Recomendaciones siguen sin bloquearse si el snapshot falla
  }
}

/**
 * Recalcula señales desde favoritos, historial, recetas corregidas y perfil;
 * persiste un snapshot en `UserLearningAggregate` para trazabilidad.
 */
export async function gatherUserSignals(userId: string): Promise<UserSignals> {
  const emptyBehavior = {
    recipeEventsLast14d: 0,
    ingredientSessionEventsLast14d: 0,
    correctedEventsLast14d: 0,
    favoritesConsidered: 0,
    correctedRecipesLoaded: 0,
  };

  const empty: UserSignals = {
    topIngredients: [],
    ingredientScores: [],
    recentRecipeHints: [],
    dislikedIngredients: [],
    dietaryRestrictions: [],
    cookingGoals: [],
    cookingLevel: null,
    behavior: emptyBehavior,
  };

  if (!hasDatabaseUrl()) return empty;

  const since = new Date(Date.now() - DAYS_14);
  const mapScores = new Map<string, number>();
  const hints: string[] = [];

  const [profile, favorites, historyEvents, correctedRecipes] =
    await Promise.all([
      getUserProfileByUserId(userId).catch(() => null),
      prisma.recipeFavorite.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: FAVORITE_RECIPES_LIMIT,
        include: {
          recipe: {
            select: {
              title: true,
              ingredients: { select: { ingredientName: true } },
            },
          },
        },
      }),
      prisma.historyEvent.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: HISTORY_LIMIT,
      }),
      prisma.recipe.findMany({
        where: { userId, sourceType: "CORRECTED" },
        orderBy: { updatedAt: "desc" },
        take: CORRECTED_RECIPES_LIMIT,
        select: {
          title: true,
          ingredients: { select: { ingredientName: true } },
        },
      }),
    ]);

  const disliked = profile?.dislikedIngredients?.length
    ? profile.dislikedIngredients.map((d) => normalizeToken(d)).filter(Boolean)
    : [];
  const dietaryRestrictions = profile?.dietaryRestrictions?.length
    ? profile.dietaryRestrictions.map((d) => d.trim()).filter(Boolean)
    : [];
  const cookingGoals = profile?.goals?.length
    ? profile.goals.map((g) => g.trim()).filter(Boolean)
    : [];
  const cookingLevel = profile?.cookingLevel ?? null;

  for (const fav of favorites) {
    addWeight(
      mapScores,
      fav.recipe.ingredients.map((i) => i.ingredientName),
      LEARNING_WEIGHTS.favoriteIngredient,
    );
    if (fav.recipe.title?.trim()) {
      hints.push(fav.recipe.title.trim());
    }
  }

  for (const row of correctedRecipes) {
    addWeight(
      mapScores,
      row.ingredients.map((i) => i.ingredientName),
      LEARNING_WEIGHTS.correctedRecipeIngredient,
    );
    if (row.title?.trim()) hints.push(row.title.trim());
  }

  let recipeEvents14 = 0;
  let ingredientSessionEvents14 = 0;
  let correctedEvents14 = 0;

  for (const ev of historyEvents) {
    const inWindow = ev.createdAt >= since;
    if (inWindow && ev.entityType === "RECIPE") {
      if (ev.actionType === "CREATED" || ev.actionType === "REGENERATED") {
        recipeEvents14 += 1;
      }
      if (ev.actionType === "CORRECTED") {
        correctedEvents14 += 1;
      }
    }

    if (inWindow && ev.entityType === "INGREDIENTS") {
      ingredientSessionEvents14 += 1;
    }

    if (ev.entityType === "RECIPE" && ev.summary) {
      const t = ev.summary
        .replace(/^Receta (generada|regenerada|corregida):\s*/i, "")
        .trim();
      if (t) {
        hints.push(t.slice(0, 120));
        addWeight(mapScores, t.split(/[\s,.;]+/), LEARNING_WEIGHTS.historyRecipeTitleHint);
      }
    }

    if (ev.metadataText) {
      try {
        const meta = JSON.parse(ev.metadataText) as { preview?: unknown };
        if (Array.isArray(meta.preview)) {
          addWeight(
            mapScores,
            meta.preview.filter((x): x is string => typeof x === "string"),
            LEARNING_WEIGHTS.historyPreviewIngredient,
          );
        }
      } catch {
        // ignore
      }
    }
  }

  const ingredientScores = [...mapScores.entries()]
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  const topIngredients = ingredientScores.map((x) => x.name).slice(0, 28);

  const recentRecipeHints = [...new Set(hints)].slice(0, 18);

  const behavior = {
    recipeEventsLast14d: recipeEvents14,
    ingredientSessionEventsLast14d: ingredientSessionEvents14,
    correctedEventsLast14d: correctedEvents14,
    favoritesConsidered: favorites.length,
    correctedRecipesLoaded: correctedRecipes.length,
  };

  const signals: UserSignals = {
    topIngredients,
    ingredientScores,
    recentRecipeHints,
    dislikedIngredients: disliked,
    dietaryRestrictions,
    cookingGoals,
    cookingLevel,
    behavior,
  };

  const persisted: UserLearningPersistedPayloadV1 = {
    v: USER_LEARNING_PAYLOAD_VERSION,
    weightsVersion: LEARNING_WEIGHTS_VERSION,
    computedAt: new Date().toISOString(),
    topIngredientScores: ingredientScores.slice(0, 22),
    recentRecipeHints,
    dislikedIngredients: disliked,
    dietaryRestrictions,
    cookingGoals,
    cookingLevel,
    behavior,
  };

  await persistSnapshot(userId, persisted);

  return signals;
}
