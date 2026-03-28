import "server-only";

import { randomUUID } from "node:crypto";

import { prisma } from "@/server/db/prisma";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export type PersistIngredientSessionParams = {
  userId: string;
  sourceType: "MANUAL" | "PHOTO";
  imageUrl?: string | null;
  storageProvider?: string | null;
  detectionProvider?: string | null;
  /** Nombres visibles de ingredientes (orden conservado). */
  ingredientNames: string[];
};

export type PersistIngredientSessionResult = {
  sessionId: string;
};

/**
 * Persiste sesión de ingredientes + ítems + evento de historial.
 */
export async function persistIngredientSession(
  params: PersistIngredientSessionParams,
): Promise<PersistIngredientSessionResult | null> {
  if (!process.env.DATABASE_URL?.trim()) return null;

  const names = params.ingredientNames
    .map((s) => s.trim())
    .filter(Boolean);
  if (names.length === 0) return null;

  const sessionId = randomUUID();
  const preview = names.slice(0, 8);

  const summary =
    params.sourceType === "PHOTO"
      ? truncate(`Foto analizada: ${names.length} ingrediente(s)`, 400)
      : truncate(`Lista manual guardada: ${names.length} ingrediente(s)`, 400);

  const metadata = {
    sourceType: params.sourceType,
    imageUrl: params.imageUrl ?? null,
    storageProvider: params.storageProvider ?? null,
    detectionProvider: params.detectionProvider ?? null,
    ingredientCount: names.length,
    preview,
  };

  await prisma.$transaction(async (tx) => {
    await tx.ingredientInputSession.create({
      data: {
        id: sessionId,
        userId: params.userId,
        sourceType: params.sourceType,
        imageUrl: params.imageUrl ? truncate(params.imageUrl, 1024) : null,
        storageProvider: params.storageProvider
          ? truncate(params.storageProvider, 80)
          : null,
        detectionProvider: params.detectionProvider
          ? truncate(params.detectionProvider, 80)
          : null,
        status: "COMPLETED",
      },
    });

    await tx.ingredientInputItem.createMany({
      data: names.map((rawName) => {
        const normalized = normalizeIngredientName(rawName);
        return {
          sessionId,
          rawName: truncate(rawName, 120),
          normalizedName: truncate(normalized, 120),
          origin:
            params.sourceType === "PHOTO"
              ? ("DETECTED" as const)
              : ("MANUAL" as const),
          wasEdited: false,
        };
      }),
    });

    await tx.historyEvent.create({
      data: {
        id: randomUUID(),
        userId: params.userId,
        entityType: "INGREDIENTS",
        entityId: sessionId,
        actionType: "CREATED",
        summary,
        metadataText: truncate(JSON.stringify(metadata), 4000),
      },
    });
  });

  return { sessionId };
}
