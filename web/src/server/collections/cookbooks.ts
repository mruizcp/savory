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

export type CookbookSummary = {
  id: string;
  name: string;
  description: string | null;
  recipeCount: number;
  createdAt: string;
  updatedAt: string;
};

export async function listCookbooks(params: {
  userId: string;
}): Promise<CookbookSummary[]> {
  if (!hasDatabaseUrl()) return [];

  const books = await prisma.cookbook.findMany({
    where: { userId: params.userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { recipes: true } },
    },
  });

  return books.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    recipeCount: b._count.recipes,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));
}

export async function createCookbook(params: {
  userId: string;
  name: string;
  description?: string | null;
}): Promise<{ id: string } | null> {
  if (!hasDatabaseUrl()) return null;

  const id = randomUUID();
  await prisma.cookbook.create({
    data: {
      id,
      userId: params.userId,
      name: truncate(params.name.trim(), 120),
      description: params.description?.trim()
        ? truncate(params.description.trim(), 500)
        : null,
    },
  });

  await logHistoryEvent({
    userId: params.userId,
    entityType: "COOKBOOK",
    entityId: id,
    actionType: "CREATED",
    summary: truncate(`Recetario creado: ${params.name.trim()}`, 400),
    metadata: { cookbookId: id, name: truncate(params.name.trim(), 120) },
  });

  return { id };
}

export async function updateCookbook(params: {
  userId: string;
  cookbookId: string;
  name?: string;
  description?: string | null;
}): Promise<boolean> {
  if (!hasDatabaseUrl()) return false;

  const existing = await prisma.cookbook.findFirst({
    where: { id: params.cookbookId, userId: params.userId },
  });
  if (!existing) return false;

  await prisma.cookbook.update({
    where: { id: params.cookbookId },
    data: {
      ...(params.name !== undefined
        ? { name: truncate(params.name.trim(), 120) }
        : {}),
      ...(params.description !== undefined
        ? {
            description:
              params.description === null || params.description === ""
                ? null
                : truncate(params.description.trim(), 500),
          }
        : {}),
    },
  });

  await logHistoryEvent({
    userId: params.userId,
    entityType: "COOKBOOK",
    entityId: params.cookbookId,
    actionType: "UPDATED",
    summary: truncate(`Recetario actualizado: ${params.name ?? existing.name}`, 400),
    metadata: { cookbookId: params.cookbookId },
  });

  return true;
}

export async function deleteCookbook(params: {
  userId: string;
  cookbookId: string;
}): Promise<boolean> {
  if (!hasDatabaseUrl()) return false;

  const existing = await prisma.cookbook.findFirst({
    where: { id: params.cookbookId, userId: params.userId },
    select: { name: true },
  });
  if (!existing) return false;

  await prisma.cookbook.delete({
    where: { id: params.cookbookId },
  });

  await logHistoryEvent({
    userId: params.userId,
    entityType: "COOKBOOK",
    entityId: params.cookbookId,
    actionType: "DELETED",
    summary: truncate(`Recetario eliminado: ${existing.name}`, 400),
    metadata: { cookbookId: params.cookbookId },
  });

  return true;
}

export type CookbookDetail = {
  id: string;
  name: string;
  description: string | null;
  recipes: Array<{
    recipeId: string;
    title: string;
    totalMinutes: number | null;
    position: number | null;
    addedAt: string;
  }>;
};

export async function getCookbookDetail(params: {
  userId: string;
  cookbookId: string;
}): Promise<CookbookDetail | null> {
  if (!hasDatabaseUrl()) return null;

  const book = await prisma.cookbook.findFirst({
    where: { id: params.cookbookId, userId: params.userId },
    include: {
      recipes: {
        include: {
          recipe: {
            select: { id: true, title: true, totalMinutes: true },
          },
        },
        orderBy: [{ position: "asc" }, { addedAt: "asc" }],
      },
    },
  });

  if (!book) return null;

  return {
    id: book.id,
    name: book.name,
    description: book.description,
    recipes: book.recipes.map((cr) => ({
      recipeId: cr.recipe.id,
      title: cr.recipe.title,
      totalMinutes: cr.recipe.totalMinutes,
      position: cr.position,
      addedAt: cr.addedAt.toISOString(),
    })),
  };
}

export async function addRecipeToCookbook(params: {
  userId: string;
  cookbookId: string;
  recipeId: string;
}): Promise<{ ok: true } | { ok: false; reason: "not_found" | "duplicate" }> {
  if (!hasDatabaseUrl()) return { ok: false, reason: "not_found" };

  const cookbook = await prisma.cookbook.findFirst({
    where: { id: params.cookbookId, userId: params.userId },
    select: { id: true, name: true },
  });
  if (!cookbook) return { ok: false, reason: "not_found" };

  const recipe = await prisma.recipe.findFirst({
    where: { id: params.recipeId, userId: params.userId },
    select: { id: true, title: true },
  });
  if (!recipe) return { ok: false, reason: "not_found" };

  const existing = await prisma.cookbookRecipe.findUnique({
    where: {
      cookbookId_recipeId: {
        cookbookId: params.cookbookId,
        recipeId: params.recipeId,
      },
    },
  });
  if (existing) return { ok: false, reason: "duplicate" };

  const agg = await prisma.cookbookRecipe.aggregate({
    where: { cookbookId: params.cookbookId },
    _max: { position: true },
  });
  const nextPos = (agg._max.position ?? 0) + 1;

  await prisma.cookbookRecipe.create({
    data: {
      id: randomUUID(),
      cookbookId: params.cookbookId,
      recipeId: params.recipeId,
      position: nextPos,
    },
  });

  await logHistoryEvent({
    userId: params.userId,
    entityType: "COOKBOOK",
    entityId: params.cookbookId,
    actionType: "UPDATED",
    summary: truncate(
      `Receta añadida a «${cookbook.name}»: ${recipe.title}`,
      400,
    ),
    metadata: {
      cookbookId: params.cookbookId,
      recipeId: params.recipeId,
      recipeTitle: recipe.title,
      action: "ADD_RECIPE",
    },
  });

  return { ok: true };
}

export async function removeRecipeFromCookbook(params: {
  userId: string;
  cookbookId: string;
  recipeId: string;
}): Promise<boolean> {
  if (!hasDatabaseUrl()) return false;

  const cookbook = await prisma.cookbook.findFirst({
    where: { id: params.cookbookId, userId: params.userId },
    select: { id: true, name: true },
  });
  if (!cookbook) return false;

  const recipe = await prisma.recipe.findFirst({
    where: { id: params.recipeId, userId: params.userId },
    select: { title: true },
  });
  if (!recipe) return false;

  const link = await prisma.cookbookRecipe.findUnique({
    where: {
      cookbookId_recipeId: {
        cookbookId: params.cookbookId,
        recipeId: params.recipeId,
      },
    },
  });
  if (!link) return false;

  await prisma.cookbookRecipe.delete({
    where: { id: link.id },
  });

  await logHistoryEvent({
    userId: params.userId,
    entityType: "COOKBOOK",
    entityId: params.cookbookId,
    actionType: "UPDATED",
    summary: truncate(
      `Receta quitada de «${cookbook.name}»: ${recipe.title}`,
      400,
    ),
    metadata: {
      cookbookId: params.cookbookId,
      recipeId: params.recipeId,
      action: "REMOVE_RECIPE",
    },
  });

  return true;
}
