"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type ShareStatusResponse = {
  active?: boolean;
  token?: string | null;
  shareUrl?: string;
  error?: string;
};

type RecipeSharePanelProps = {
  recipeId: string;
};

export function RecipeSharePanel({ recipeId }: RecipeSharePanelProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/share`);
      const data = (await res.json()) as ShareStatusResponse;
      if (res.ok) {
        setActive(Boolean(data.active));
        setShareUrl(data.shareUrl ?? null);
      }
    } catch {
      // ignorar
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleGenerate() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/share`, {
        method: "POST",
      });
      const data = (await res.json()) as ShareStatusResponse & {
        shareUrl?: string;
      };
      if (!res.ok) {
        setMessage(data.error ?? "No se pudo generar el enlace.");
        return;
      }
      setShareUrl(data.shareUrl ?? null);
      setActive(true);
      setMessage("Enlace listo. El anterior dejó de funcionar si existía.");
    } catch {
      setMessage("Error de red.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/share`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "No se pudo revocar.");
        return;
      }
      setShareUrl(null);
      setActive(false);
      setMessage("Enlace público desactivado.");
    } catch {
      setMessage("Error de red.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage("Copiado al portapapeles.");
    } catch {
      setMessage("No se pudo copiar. Copia el texto manualmente.");
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Cargando enlace…</p>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-semibold tracking-tight">
        Compartir receta
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Crea un enlace único. Cualquiera con el enlace puede ver la receta (sin
        editar). Renovar invalida el enlace anterior.
      </p>

      {active && shareUrl ? (
        <div className="mt-4 space-y-2">
          <p className="break-all rounded-lg bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground">
            {shareUrl}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleCopy()}
            >
              Copiar enlace
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleGenerate()}
              disabled={busy}
            >
              {busy ? "…" : "Renovar enlace"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void handleRevoke()}
              disabled={busy}
            >
              Desactivar enlace
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <Button type="button" onClick={() => void handleGenerate()} disabled={busy}>
            {busy ? "Generando…" : "Generar enlace público"}
          </Button>
        </div>
      )}

      {message ? (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
