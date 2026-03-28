import "server-only";

import type { HistoryBucket } from "@/lib/history/types";

export type { HistoryBucket } from "@/lib/history/types";

export function parseHistoryMetadata(
  metadataText: string | null,
): Record<string, unknown> | null {
  if (!metadataText?.trim()) return null;
  try {
    const parsed = JSON.parse(metadataText) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export function deriveHistoryBucket(
  entityType: string,
  actionType: string,
  metadata: Record<string, unknown> | null,
): HistoryBucket {
  if (entityType === "PROFILE") return "change";

  if (entityType === "INGREDIENTS") {
    const st = metadata?.sourceType;
    if (st === "PHOTO") return "photo";
    return "ingredient";
  }

  if (entityType === "RECIPE") {
    if (actionType === "UPDATED") return "change";
    if (actionType === "CORRECTED") return "recipe";
    return "recipe";
  }

  if (entityType === "FAVORITE" || entityType === "COOKBOOK") {
    return "collection";
  }

  return "change";
}
