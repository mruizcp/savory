"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { RecipeFavoriteButton } from "@/components/recipes/recipe-favorite-button";
import { Button } from "@/components/ui/button";
import { getRecipeCardMessages } from "@/lib/i18n/recipe-card-messages";
import { useI18n } from "@/lib/i18n/i18n-context";

type FavoriteItem = {
  recipeId: string;
  title: string;
  totalMinutes: number | null;
  favoritedAt: string;
};

export function FavoritesPageClient() {
  const { locale } = useI18n();
  const rc = getRecipeCardMessages(locale);
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/favorites");
      const data = (await res.json()) as {
        items?: FavoriteItem[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudieron cargar los favoritos.");
        return;
      }
      setItems(data.items ?? []);
    } catch {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {rc.favoriteEmptyIntro}{" "}
        <Link
          href="/recetas/explorar"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {rc.favoriteEmptyExplore}
        </Link>{" "}
        {rc.favoriteEmptyOutro}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.recipeId}
          className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/recetas/${item.recipeId}`}
              className="min-w-0 flex-1 font-medium text-foreground hover:underline"
            >
              {item.title}
            </Link>
            <RecipeFavoriteButton
              recipeId={item.recipeId}
              initialFavorited
              variant="icon"
              onChange={(fav) => {
                if (!fav) {
                  setItems((prev) =>
                    prev.filter((x) => x.recipeId !== item.recipeId),
                  );
                }
              }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.totalMinutes != null ? `${item.totalMinutes} min · ` : null}
            Guardado el{" "}
            {new Intl.DateTimeFormat("es", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(item.favoritedAt))}
          </p>
        </li>
      ))}
      <li>
        <Button type="button" variant="ghost" onClick={() => void load()}>
          Actualizar
        </Button>
      </li>
    </ul>
  );
}
