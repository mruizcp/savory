"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type CookbookRow = {
  id: string;
  name: string;
  description: string | null;
  recipeCount: number;
  updatedAt: string;
};

export function CookbooksPageClient() {
  const router = useRouter();
  const [cookbooks, setCookbooks] = useState<CookbookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cookbooks");
      const data = (await res.json()) as {
        cookbooks?: CookbookRow[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudieron cargar los recetarios.");
        return;
      }
      setCookbooks(data.cookbooks ?? []);
    } catch {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/cookbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          description: description.trim() || null,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear.");
        return;
      }
      setName("");
      setDescription("");
      if (data.id) {
        router.push(`/recetarios/${data.id}`);
        return;
      }
      await load();
    } catch {
      setError("Error de red.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>;
  }

  return (
    <div className="mt-8 space-y-8">
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
      >
        <h2 className="text-base font-semibold">Nuevo recetario</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea una colección (por ejemplo: “Semana sana”, “Postres”).
        </p>
        <label className="mt-4 block text-sm font-medium" htmlFor="cb-name">
          Nombre
        </label>
        <input
          id="cb-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-accent focus-visible:ring-2"
          maxLength={120}
          required
        />
        <label
          className="mt-3 block text-sm font-medium"
          htmlFor="cb-desc"
        >
          Descripción (opcional)
        </label>
        <textarea
          id="cb-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={500}
          className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-accent focus-visible:ring-2"
        />
        <Button type="submit" className="mt-4" disabled={creating || !name.trim()}>
          {creating ? "Creando…" : "Crear recetario"}
        </Button>
      </form>

      <section>
        <h2 className="text-base font-semibold">Tus recetarios</h2>
        {cookbooks.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Aún no tienes recetarios. Crea uno arriba.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {cookbooks.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
              >
                <Link
                  href={`/recetarios/${c.id}`}
                  className="font-medium hover:underline"
                >
                  {c.name}
                </Link>
                {c.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.description}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.recipeCount}{" "}
                  {c.recipeCount === 1 ? "receta" : "recetas"}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Button type="button" variant="ghost" className="mt-4" onClick={() => void load()}>
          Actualizar lista
        </Button>
      </section>
    </div>
  );
}
