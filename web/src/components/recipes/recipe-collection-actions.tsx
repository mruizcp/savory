"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RecipeFavoriteButton } from "@/components/recipes/recipe-favorite-button";
import { Button } from "@/components/ui/button";

type CookbookOption = { id: string; name: string };

type RecipeCollectionActionsProps = {
  recipeId: string;
  initialFavorited: boolean;
};

export function RecipeCollectionActions({
  recipeId,
  initialFavorited,
}: RecipeCollectionActionsProps) {
  const [cookbooks, setCookbooks] = useState<CookbookOption[]>([]);
  const [selectedCookbookId, setSelectedCookbookId] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCookbooks() {
      try {
        const res = await fetch("/api/cookbooks");
        const data = (await res.json()) as {
          cookbooks?: Array<{ id: string; name: string }>;
        };
        if (res.ok && data.cookbooks) {
          setCookbooks(data.cookbooks);
          if (data.cookbooks.length > 0) {
            setSelectedCookbookId((prev) => prev || data.cookbooks![0].id);
          }
        }
      } catch {
        // ignorar
      }
    }
    void loadCookbooks();
  }, []);

  async function handleAddToCookbook() {
    if (!selectedCookbookId) {
      setMessage("Crea un recetario primero.");
      return;
    }
    setAddLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/cookbooks/${selectedCookbookId}/recipes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId }),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "No se pudo añadir al recetario.");
        return;
      }
      setMessage("Receta añadida al recetario.");
    } catch {
      setMessage("Error de red.");
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <RecipeFavoriteButton
          recipeId={recipeId}
          initialFavorited={initialFavorited}
          variant="labeled"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-md sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Recetario</span>
          <select
            value={selectedCookbookId}
            onChange={(e) => setSelectedCookbookId(e.target.value)}
            className="min-h-11 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-accent focus-visible:ring-2"
          >
            {cookbooks.length === 0 ? (
              <option value="">— Sin recetarios —</option>
            ) : (
              cookbooks.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))
            )}
          </select>
        </label>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleAddToCookbook()}
          disabled={addLoading || cookbooks.length === 0}
        >
          {addLoading ? "…" : "Añadir al recetario"}
        </Button>
      </div>

      {cookbooks.length === 0 ? (
        <p className="w-full text-xs text-muted-foreground">
          <Link href="/recetarios" className="font-medium text-accent underline-offset-4 hover:underline">
            Crea un recetario
          </Link>{" "}
          para organizar colecciones.
        </p>
      ) : null}

      {message ? (
        <p
          className="w-full text-sm text-muted-foreground"
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
