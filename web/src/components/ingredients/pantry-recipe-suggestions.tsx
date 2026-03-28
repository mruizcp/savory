"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  RecipeCard,
  type RecipeCardSavedRecipe,
} from "@/components/recipes/recipe-card";
import { ButtonLink } from "@/components/ui/button-link";
import { useI18n } from "@/lib/i18n/i18n-context";

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "empty" }
  | { status: "unauthenticated" }
  | { status: "noDatabase" }
  | {
      status: "success";
      recipes: RecipeCardSavedRecipe[];
      matchMode: "strict" | "relaxed";
    }
  | { status: "error" };

type PantryRecipeSuggestionsProps = {
  ingredients: string[];
  active: boolean;
};

export function PantryRecipeSuggestions({
  ingredients,
  active,
}: PantryRecipeSuggestionsProps) {
  const { t } = useI18n();
  const [state, setState] = useState<FetchState>({ status: "idle" });
  const requestSeq = useRef(0);

  const ingredientsKey = useMemo(
    () =>
      [...ingredients]
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .sort()
        .join("\u0001"),
    [ingredients],
  );

  useEffect(() => {
    if (!active || ingredients.length === 0) {
      setState({ status: "idle" });
      return;
    }

    const seq = ++requestSeq.current;
    setState({ status: "loading" });

    const controller = new AbortController();
    const payload = [...ingredients];

    void (async () => {
      try {
        const res = await fetch("/api/recipes/suggest-by-ingredients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients: payload }),
          signal: controller.signal,
        });

        if (seq !== requestSeq.current) return;

        if (res.status === 401) {
          setState({ status: "unauthenticated" });
          return;
        }

        const data = (await res.json()) as {
          recipes?: RecipeCardSavedRecipe[];
          matchMode?: "strict" | "relaxed";
          persistenceAvailable?: boolean;
          error?: string;
        };

        if (seq !== requestSeq.current) return;

        if (!res.ok) {
          setState({ status: "error" });
          return;
        }

        if (data.persistenceAvailable === false) {
          setState({ status: "noDatabase" });
          return;
        }

        const list = data.recipes ?? [];
        if (list.length === 0) {
          setState({ status: "empty" });
          return;
        }

        setState({
          status: "success",
          recipes: list,
          matchMode: data.matchMode === "relaxed" ? "relaxed" : "strict",
        });
      } catch (e) {
        if (controller.signal.aborted) return;
        if (seq !== requestSeq.current) return;
        setState({ status: "error" });
      }
    })();

    return () => {
      controller.abort();
    };
    /** Solo `ingredientsKey` + `active`: evita re-ejecutar en cada nueva referencia de array (antes el setTimeout se cancelaba y no llegaba a hacer fetch). */
  }, [active, ingredientsKey]);

  if (!active || ingredients.length === 0) {
    return null;
  }

  if (state.status === "idle" || state.status === "loading") {
    return (
      <div className="mt-8 border-t border-border/60 pt-8">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {t("pantry.title")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("pantry.loading")}</p>
        <div
          className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <span
            className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden
          />
        </div>
      </div>
    );
  }

  if (state.status === "unauthenticated") {
    return (
      <div className="mt-8 rounded-2xl border border-border/80 bg-muted/30 px-4 py-5 sm:px-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {t("pantry.title")}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("pantry.loginPrompt")}
        </p>
        <ButtonLink href="/login" className="mt-4">
          {t("pantry.loginCta")}
        </ButtonLink>
      </div>
    );
  }

  if (state.status === "noDatabase") {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-5 sm:px-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {t("pantry.title")}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{t("pantry.noDatabase")}</p>
      </div>
    );
  }

  if (state.status === "empty") {
    return (
      <div className="mt-8 border-t border-border/60 pt-8">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {t("pantry.title")}
        </h3>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t("pantry.empty")}
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mt-8 border-t border-border/60 pt-8">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {t("pantry.title")}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{t("pantry.error")}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-border/60 pt-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {t("pantry.title")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {state.matchMode === "relaxed"
              ? t("pantry.successSubtitleRelaxed")
              : t("pantry.successSubtitle")}
          </p>
        </div>
      </div>
      <ul className="mt-5 grid list-none gap-4 sm:grid-cols-2">
        {state.recipes.map((recipe) => (
          <li key={recipe.id}>
            <RecipeCard variant="saved" recipe={recipe} />
          </li>
        ))}
      </ul>
    </div>
  );
}
