import "server-only";

import { randomUUID } from "node:crypto";

import { logHistoryEvent } from "@/server/history/log-history-event";
import { prisma } from "@/server/db/prisma";

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

export async function getFavoriteStatus(params: {
  userId: string;
  recipeId: string;
}): Promise<boolean> {
  if (!hasDatabaseUrl()) return false;
  const row = await prisma.recipeFavorite.findUnique({
    where: {
      userId_recipeId: {
        userId: params.userId,
        recipeId: params.recipeId,
      },
    },
    select: { id: true },
  });
  return Boolean(row);
}

export async function toggleRecipeFavorite(params: {
  userId: string;
  recipeId: string;
}): Promise<{ favorited: boolean } | null> {
  if (!hasDatabaseUrl()) return null;

  const recipe = await prisma.recipe.findFirst({
    where: { id: params.recipeId, userId: params.userId },
    select: { id: true, title: true },
  });
  if (!recipe) return null;

  const existing = await prisma.recipeFavorite.findUnique({
    where: {
      userId_recipeId: {
        userId: params.userId,
        recipeId: params.recipeId,
      },
    },
  });

  if (existing) {
    await prisma.recipeFavorite.delete({
      where: { id: existing.id },
    });
    await logHistoryEvent({
      userId: params.userId,
      entityType: "FAVORITE",
      entityId: params.recipeId,
      actionType: "DELETED",
      summary: truncate(`Quitada de favoritos: ${recipe.title}`, 400),
      metadata: { recipeId: params.recipeId, recipeTitle: recipe.title },
    });
    return { favorited: false };
  }

  await prisma.recipeFavorite.create({
    data: {
      id: randomUUID(),
      userId: params.userId,
      recipeId: params.recipeId,
    },
  });
  await logHistoryEvent({
    userId: params.userId,
    entityType: "FAVORITE",
    entityId: params.recipeId,
    actionType: "CREATED",
    summary: truncate(`Añadida a favoritos: ${recipe.title}`, 400),
    metadata: { recipeId: params.recipeId, recipeTitle: recipe.title },
  });
  return { favorited: true };
}

export type FavoriteListItem = {
  recipeId: string;
  title: string;
  totalMinutes: number | null;
  favoritedAt: string;
};

export async function listFavoriteRecipes(params: {
  userId: string;
}): Promise<FavoriteListItem[]> {
  if (!hasDatabaseUrl()) return [];

  const rows = await prisma.recipeFavorite.findMany({
    where: { userId: params.userId },
    orderBy: { createdAt: "desc" },
    include: {
      recipe: {
        select: {
          id: true,
          title: true,
          totalMinutes: true,
        },
      },
    },
  });

  return rows.map((r) => ({
    recipeId: r.recipe.id,
    title: r.recipe.title,
    totalMinutes: r.recipe.totalMinutes,
    favoritedAt: r.createdAt.toISOString(),
  }));
}
