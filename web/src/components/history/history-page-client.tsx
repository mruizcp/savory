"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { HistoryBucket } from "@/lib/history/types";

type HistoryEntry = {
  id: string;
  createdAt: string;
  entityType: string;
  actionType: string;
  entityId: string | null;
  summary: string;
  metadata: Record<string, unknown> | null;
  bucket: HistoryBucket;
};

const BUCKET_LABEL: Record<HistoryBucket | "all", string> = {
  all: "Todo",
  ingredient: "Ingredientes",
  photo: "Fotos",
  recipe: "Recetas",
  change: "Cambios",
  collection: "Colecciones",
};

const BUCKET_STYLE: Record<HistoryBucket, string> = {
  ingredient:
    "border-emerald-500/40 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
  photo:
    "border-amber-500/40 bg-amber-50/60 text-amber-950 dark:bg-amber-950/25 dark:text-amber-100",
  recipe:
    "border-violet-500/40 bg-violet-50/60 text-violet-950 dark:bg-violet-950/25 dark:text-violet-100",
  change:
    "border-sky-500/40 bg-sky-50/60 text-sky-950 dark:bg-sky-950/25 dark:text-sky-100",
  collection:
    "border-rose-500/40 bg-rose-50/60 text-rose-950 dark:bg-rose-950/25 dark:text-rose-100",
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("es", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

type HistoryPageClientProps = {
  /** False si falta DATABASE_URL en el servidor (no hay filas que cargar). */
  persistenceAvailable: boolean;
};

export function HistoryPageClient({
  persistenceAvailable,
}: HistoryPageClientProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(persistenceAvailable);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<HistoryBucket | "all">("all");

  const load = useCallback(async () => {
    if (!persistenceAvailable) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/history?limit=80");
      const data = (await res.json()) as {
        entries?: HistoryEntry[];
        persistenceAvailable?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo cargar el historial.");
        return;
      }
      if (data.persistenceAvailable === false) {
        setEntries([]);
        setError(
          "El servidor no tiene base de datos configurada; no hay historial que mostrar.",
        );
        return;
      }
      setEntries(data.entries ?? []);
    } catch {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  }, [persistenceAvailable]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((e) => e.bucket === filter);
  }, [entries, filter]);

  if (!persistenceAvailable) {
    return (
      <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-50/60 p-6 text-sm leading-relaxed text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/25 dark:text-amber-50">
        <p className="font-medium">No se puede registrar historial</p>
        <p className="mt-2 text-muted-foreground dark:text-amber-100/85">
          Falta la variable de entorno{" "}
          <code className="rounded bg-amber-100/90 px-1.5 py-0.5 font-mono text-[0.85rem] text-foreground dark:bg-amber-900/60">
            DATABASE_URL
          </code>{" "}
          en el servidor. Configura la base de datos (véase{" "}
          <code className="font-mono text-[0.85rem]">docs/architecture.md</code>
          ) y reinicia la aplicación. Las acciones en la app no quedarán
          guardadas en el servidor hasta entonces.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(BUCKET_LABEL) as Array<HistoryBucket | "all">).map(
          (key) => (
            <Button
              key={key}
              type="button"
              variant={filter === key ? "primary" : "secondary"}
              className="text-xs sm:text-sm"
              onClick={() => setFilter(key)}
            >
              {BUCKET_LABEL[key]}
            </Button>
          ),
        )}
        <Button
          type="button"
          variant="ghost"
          className="text-xs sm:text-sm"
          onClick={() => void load()}
          disabled={loading}
        >
          Actualizar
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando historial…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {entries.length === 0
            ? "Aún no hay actividad registrada en el servidor. Guarda ingredientes, analiza una foto o genera recetas."
            : "No hay entradas en este filtro."}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((entry) => (
            <li
              key={entry.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${BUCKET_STYLE[entry.bucket]}`}
                >
                  {BUCKET_LABEL[entry.bucket]}
                </span>
                <time
                  className="text-xs text-muted-foreground"
                  dateTime={entry.createdAt}
                >
                  {formatDate(entry.createdAt)}
                </time>
              </div>
              <p className="mt-2 text-sm font-medium leading-snug">
                {entry.summary}
              </p>
              {entry.metadata?.preview &&
              Array.isArray(entry.metadata.preview) ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {(entry.metadata.preview as string[]).join(", ")}
                </p>
              ) : null}
              {entry.entityType === "RECIPE" &&
              entry.entityId &&
              entry.actionType !== "FAILED" ? (
                <p className="mt-3">
                  <Link
                    href={`/recetas/${entry.entityId}`}
                    className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                  >
                    {entry.actionType === "SHARED"
                      ? "Abrir receta"
                      : "Ver receta"}
                  </Link>
                </p>
              ) : null}
              {entry.entityType === "FAVORITE" && entry.entityId ? (
                <p className="mt-3">
                  <Link
                    href={`/recetas/${entry.entityId}`}
                    className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                  >
                    Ver receta
                  </Link>
                </p>
              ) : null}
              {entry.entityType === "COOKBOOK" &&
              entry.entityId &&
              entry.actionType !== "DELETED" ? (
                <p className="mt-3">
                  <Link
                    href={`/recetarios/${entry.entityId}`}
                    className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                  >
                    Ver recetario
                  </Link>
                </p>
              ) : null}
              {entry.entityType === "RECIPE" && entry.actionType === "FAILED" ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Revisa OPENAI_API_KEY y vuelve a intentar desde Recetas.
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
