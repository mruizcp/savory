import "server-only";

import type { HistoryBucket } from "@/lib/history/types";
import { prisma } from "@/server/db/prisma";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";
import {
  deriveHistoryBucket,
  parseHistoryMetadata,
} from "@/server/history/derive-history-bucket";

export type HistoryListRow = {
  id: string;
  createdAt: string;
  entityType: string;
  actionType: string;
  entityId: string | null;
  summary: string;
  metadata: Record<string, unknown> | null;
  bucket: HistoryBucket;
};

export async function getHistoryForUser(params: {
  userId: string;
  limit?: number;
}): Promise<HistoryListRow[]> {
  if (!isDatabaseConfigured()) return [];

  const limit = Math.min(100, Math.max(1, params.limit ?? 50));

  const rows = await prisma.historyEvent.findMany({
    where: { userId: params.userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((row) => {
    const metadata = parseHistoryMetadata(row.metadataText);
    return {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      entityType: row.entityType,
      actionType: row.actionType,
      entityId: row.entityId,
      summary: row.summary,
      metadata,
      bucket: deriveHistoryBucket(
        row.entityType,
        row.actionType,
        metadata,
      ),
    };
  });
}
