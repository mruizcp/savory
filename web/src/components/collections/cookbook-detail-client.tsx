"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type CookbookDetail = {
  id: string;
  name: string;
  description: string | null;
  recipes: Array<{
    recipeId: string;
    title: string;
    totalMinutes: number | null;
    addedAt: string;
  }>;
};

type CookbookDetailClientProps = {
  cookbookId: string;
};

export function CookbookDetailClient({ cookbookId }: CookbookDetailClientProps) {
  const router = useRouter();
  const [cookbook, setCookbook] = useState<CookbookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cookbooks/${cookbookId}`);
      const data = (await res.json()) as {
        cookbook?: CookbookDetail;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo cargar el recetario.");
        setCookbook(null);
        return;
      }
      setCookbook(data.cookbook ?? null);
    } catch {
      setError("Error de red.");
      setCookbook(null);
    } finally {
      setLoading(false);
    }
  }, [cookbookId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRemove(recipeId: string) {
    setRemoving(recipeId);
    try {
      const res = await fetch(
        `/api/cookbooks/${cookbookId}/recipes?recipeId=${encodeURIComponent(recipeId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "No se pudo quitar.");
        return;
      }
      await load();
    } catch {
      setError("Error de red.");
    } finally {
      setRemoving(null);
    }
  }

  async function handleDeleteCookbook() {
    if (!confirm("¿Eliminar este recetario? Las recetas no se borran.")) {
      return;
    }
    try {
      const res = await fetch(`/api/cookbooks/${cookbookId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("No se pudo eliminar.");
        return;
      }
      router.push("/recetarios");
    } catch {
      setError("Error de red.");
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>;
  }

  if (error || !cookbook) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {error ?? "Recetario no encontrado."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <nav>
        <Link
          href="/recetarios"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Volver a recetarios
        </Link>
      </nav>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{cookbook.name}</h1>
        {cookbook.description ? (
          <p className="mt-2 text-sm text-muted-foreground">{cookbook.description}</p>
        ) : null}
      </header>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => void load()}>
          Actualizar
        </Button>
        <Button type="button" variant="ghost" onClick={() => void handleDeleteCookbook()}>
          Eliminar recetario
        </Button>
      </div>

      {cookbook.recipes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay recetas. Añádelas desde el detalle de cada receta.
        </p>
      ) : (
        <ul className="space-y-3">
          {cookbook.recipes.map((r) => (
            <li
              key={r.recipeId}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/recetas/${r.recipeId}`}
                  className="font-medium hover:underline"
                >
                  {r.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {r.totalMinutes != null ? `${r.totalMinutes} min · ` : null}
                  Añadida{" "}
                  {new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(
                    new Date(r.addedAt),
                  )}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled={removing === r.recipeId}
                onClick={() => void handleRemove(r.recipeId)}
              >
                {removing === r.recipeId ? "…" : "Quitar de la colección"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
