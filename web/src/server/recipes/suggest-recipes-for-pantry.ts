import "server-only";

import { prisma } from "@/server/db/prisma";

export type PantryRecipeSuggestion = {
  id: string;
  title: string;
  totalMinutes: number | null;
  calories: number | null;
  difficulty: string | null;
  missingIngredientNames: string[];
};

function normalizePantry(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of raw) {
    const t = s.trim().replace(/\s+/g, " ");
    if (!t) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9áéíóúñü]+/gi)
    .filter((x) => x.length > 1);
}

/**
 * Coincidencia flexible entre nombres de despensa y nombre en receta (substring o solapamiento de tokens).
 */
function pantryCoversRecipeIngredient(
  pantryLower: string[],
  recipeIngName: string,
): boolean {
  const r = recipeIngName.trim().toLowerCase();
  if (!r) return false;

  for (const p of pantryLower) {
    const pl = p.trim().toLowerCase();
    if (!pl) continue;
    if (r === pl) return true;
    if (r.includes(pl) || pl.includes(r)) return true;

    const rt = tokenize(r);
    const pt = tokenize(pl);
    if (
      rt.some((t) => pt.some((u) => t === u || t.includes(u) || u.includes(t)))
    ) {
      return true;
    }
  }
  return false;
}

export type SuggestRecipesForPantryResult = {
  recipes: PantryRecipeSuggestion[];
  matchMode: "strict" | "relaxed";
};

export async function suggestRecipesForPantry(params: {
  userId: string;
  pantryIngredientNames: string[];
  limit?: number;
}): Promise<SuggestRecipesForPantryResult> {
  const pantry = normalizePantry(params.pantryIngredientNames);
  if (pantry.length === 0) {
    return { recipes: [], matchMode: "strict" };
  }

  const pantryLower = pantry.map((p) => p.toLowerCase());
  const take = Math.min(50, Math.max(1, params.limit ?? 12));

  const rows = await prisma.recipe.findMany({
    where: { userId: params.userId },
    orderBy: { updatedAt: "desc" },
    take: 120,
    select: {
      id: true,
      title: true,
      totalMinutes: true,
      calories: true,
      difficulty: true,
      updatedAt: true,
      ingredients: {
        select: { ingredientName: true },
      },
    },
  });

  type Scored = {
    row: (typeof rows)[number];
    missing: string[];
    /** Ingredientes de la receta que coinciden con al menos un ítem de despensa */
    matchedRecipeIngredientCount: number;
    /** Cuántos ítems de despensa aparecen en la receta (cada uno cuenta una vez) */
    pantryItemsCovered: number;
    /** Todos los ítems de despensa tienen al menos un ingrediente en la receta */
    allPantryCovered: boolean;
  };

  const scored: Scored[] = rows.map((row) => {
    const missing: string[] = [];
    const missingKeys = new Set<string>();
    let matchedRecipeIngredientCount = 0;

    for (const ing of row.ingredients) {
      const name = ing.ingredientName.trim();
      if (!name) continue;
      if (pantryCoversRecipeIngredient(pantryLower, name)) {
        matchedRecipeIngredientCount += 1;
      } else {
        const key = name.toLowerCase();
        if (!missingKeys.has(key)) {
          missingKeys.add(key);
          missing.push(name);
        }
      }
    }

    let pantryItemsCovered = 0;
    for (const p of pantryLower) {
      const covered = row.ingredients.some((ing) => {
        const name = ing.ingredientName.trim();
        if (!name) return false;
        return pantryCoversRecipeIngredient([p], name);
      });
      if (covered) pantryItemsCovered += 1;
    }

    const allPantryCovered =
      pantry.length > 0 && pantryItemsCovered === pantry.length;

    return {
      row,
      missing,
      matchedRecipeIngredientCount,
      pantryItemsCovered,
      allPantryCovered,
    };
  });

  /** Solo recetas donde consta al menos un ingrediente de despensa en la receta */
  const withOverlap = scored.filter((s) => s.pantryItemsCovered >= 1);

  let pool = withOverlap.filter((s) => s.allPantryCovered);
  let matchMode: "strict" | "relaxed" = "strict";

  if (pool.length === 0 && withOverlap.length > 0) {
    pool = withOverlap;
    matchMode = "relaxed";
  }

  if (matchMode === "strict") {
    pool.sort((a, b) => {
      if (a.missing.length !== b.missing.length) {
        return a.missing.length - b.missing.length;
      }
      return b.row.updatedAt.getTime() - a.row.updatedAt.getTime();
    });
  } else {
    pool.sort((a, b) => {
      if (b.pantryItemsCovered !== a.pantryItemsCovered) {
        return b.pantryItemsCovered - a.pantryItemsCovered;
      }
      if (b.matchedRecipeIngredientCount !== a.matchedRecipeIngredientCount) {
        return b.matchedRecipeIngredientCount - a.matchedRecipeIngredientCount;
      }
      if (a.missing.length !== b.missing.length) {
        return a.missing.length - b.missing.length;
      }
      return b.row.updatedAt.getTime() - a.row.updatedAt.getTime();
    });
  }

  const out = pool.slice(0, take).map((s) => ({
    id: s.row.id,
    title: s.row.title,
    totalMinutes: s.row.totalMinutes,
    calories: s.row.calories,
    difficulty: s.row.difficulty,
    missingIngredientNames: s.missing,
  }));

  return { recipes: out, matchMode };
}
