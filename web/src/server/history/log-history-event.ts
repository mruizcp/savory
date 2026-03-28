import "server-only";

import { randomUUID } from "node:crypto";

import { prisma } from "@/server/db/prisma";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

export type LogHistoryEventParams = {
  userId: string;
  entityType: string;
  entityId: string | null;
  actionType: string;
  summary: string;
  metadata?: Record<string, unknown> | null;
};

export async function logHistoryEvent(
  params: LogHistoryEventParams,
): Promise<void> {
  if (!process.env.DATABASE_URL?.trim()) return;

  let metadataText: string | null = null;
  if (params.metadata && Object.keys(params.metadata).length > 0) {
    try {
      metadataText = truncate(JSON.stringify(params.metadata), 4000);
    } catch {
      metadataText = null;
    }
  }

  await prisma.historyEvent.create({
    data: {
      id: randomUUID(),
      userId: params.userId,
      entityType: truncate(params.entityType, 40),
      entityId: params.entityId ? truncate(params.entityId, 128) : null,
      actionType: truncate(params.actionType, 40),
      summary: truncate(params.summary, 400),
      metadataText,
    },
  });
}
