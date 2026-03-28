import "server-only";

import type { Prisma } from "@prisma/client";

import type { RecipeSearchSummary } from "@/lib/recipes/recipe-search-summary";
import { prisma } from "@/server/db/prisma";

export type RecipeSearchFilters = {
  difficulty?: string;
  maxMinutes?: number;
  mealType?: string;
  dietTag?: string;
};

/**
 * Busca recetas guardadas del usuario: título, descripción o nombre de ingrediente,
 * combinado con filtros opcionales (dificultad, tiempo máximo, tipo de comida, dieta).
 * `query` vacío: no filtra por texto; sigue aplicando filtros y orden por actualización.
 */
export async function searchRecipesForUser(params: {
  userId: string;
  query: string;
  limit: number;
  filters?: RecipeSearchFilters;
}): Promise<RecipeSearchSummary[]> {
  const take = Math.min(50, Math.max(1, params.limit));
  const term = params.query.trim();
  const f = params.filters;

  const andParts: Prisma.RecipeWhereInput[] = [];

  if (f?.difficulty) {
    andParts.push({ difficulty: f.difficulty });
  }
  if (f?.maxMinutes != null && f.maxMinutes > 0) {
    andParts.push({ totalMinutes: { lte: f.maxMinutes } });
  }
  if (f?.mealType) {
    andParts.push({ mealType: f.mealType });
  }
  if (f?.dietTag) {
    const code = f.dietTag.trim().toUpperCase();
    andParts.push({ dietTagsCsv: { contains: `,${code},` } });
  }

  const textClause: Prisma.RecipeWhereInput | null = term
    ? {
        OR: [
          { title: { contains: term } },
          { description: { contains: term } },
          {
            ingredients: {
              some: { ingredientName: { contains: term } },
            },
          },
        ],
      }
    : null;

  const where: Prisma.RecipeWhereInput = {
    userId: params.userId,
    AND: [...(textClause ? [textClause] : []), ...andParts],
  };

  const baseSelect = {
    id: true,
    title: true,
    description: true,
    totalMinutes: true,
    difficulty: true,
    mealType: true,
    dietTagsCsv: true,
    createdAt: true,
    updatedAt: true,
    favorites: {
      where: { userId: params.userId },
      take: 1,
      select: { id: true },
    },
  } as const;

  const rows = await prisma.recipe.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take,
    select: baseSelect,
  });

  return rows.map((row) => mapRow(row));
}

function mapRow(
  r: {
    id: string;
    title: string;
    description: string | null;
    totalMinutes: number | null;
    difficulty: string | null;
    mealType: string | null;
    dietTagsCsv: string | null;
    createdAt: Date;
    updatedAt: Date;
    favorites: { id: string }[];
  },
): RecipeSearchSummary {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    totalMinutes: r.totalMinutes,
    difficulty: r.difficulty,
    mealType: r.mealType,
    dietTagsCsv: r.dietTagsCsv,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    isFavorite: r.favorites.length > 0,
  };
}
