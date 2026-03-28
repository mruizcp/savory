"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getRecipeCardMessages } from "@/lib/i18n/recipe-card-messages";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils/cn";

type RecipeFavoriteButtonProps = {
  recipeId: string;
  initialFavorited: boolean;
  /** Icono compacto (listados) o botón con texto (detalle). */
  variant?: "icon" | "labeled";
  className?: string;
  /** Tras un toggle correcto (para quitar filas o sincronizar listas). */
  onChange?: (favorited: boolean) => void;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={filled ? 0 : 1.75}
      className="h-5 w-5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
      />
    </svg>
  );
}

export function RecipeFavoriteButton({
  recipeId,
  initialFavorited,
  variant = "icon",
  className,
  onChange,
}: RecipeFavoriteButtonProps) {
  const { locale } = useI18n();
  const rc = getRecipeCardMessages(locale);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/recipes/${encodeURIComponent(recipeId)}/favorite`,
        { method: "POST" },
      );
      const data = (await res.json()) as { favorited?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? rc.favoriteError);
        return;
      }
      if (typeof data.favorited === "boolean") {
        setFavorited(data.favorited);
        onChange?.(data.favorited);
      }
    } catch {
      setError(rc.favoriteNetworkError);
    } finally {
      setLoading(false);
    }
  }

  const addLabel = rc.favoriteAdd;
  const removeLabel = rc.favoriteRemove;
  const ariaLabel = favorited ? removeLabel : addLabel;

  if (variant === "labeled") {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <Button
          type="button"
          variant={favorited ? "primary" : "secondary"}
          onClick={() => void toggle()}
          disabled={loading}
          className="min-h-11"
        >
          {loading ? "…" : favorited ? removeLabel : addLabel}
        </Button>
        {error ? (
          <p className="text-xs text-amber-700 dark:text-amber-400" role="status">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-end gap-0.5", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "min-h-9 min-w-9 shrink-0 rounded-xl px-0",
          favorited
            ? "text-primary"
            : "text-muted-foreground hover:text-primary",
        )}
        aria-pressed={favorited}
        aria-label={ariaLabel}
        title={ariaLabel}
        disabled={loading}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void toggle();
        }}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <HeartIcon filled={favorited} />
        )}
      </Button>
      {error ? (
        <span className="max-w-[10rem] text-right text-[10px] text-amber-700 dark:text-amber-400">
          {error}
        </span>
      ) : null}
    </div>
  );
}
