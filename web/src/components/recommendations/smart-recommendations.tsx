"use client";

import { useCallback, useEffect, useState } from "react";

import { RecipeCard } from "@/components/recipes/recipe-card";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { RecommendationSuggestion } from "@/lib/recommendations/recommendation-schema";

type ApiResponse = {
  suggestions?: RecommendationSuggestion[];
  source?: "ai" | "rules";
  error?: string;
};

export function SmartRecommendations() {
  const { t } = useI18n();
  const [suggestions, setSuggestions] = useState<RecommendationSuggestion[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommendations");
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setError(data.error ?? t("recommendations.loadError"));
        return;
      }
      setSuggestions(data.suggestions ?? []);
    } catch {
      setError(t("recommendations.networkError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <section aria-busy="true" aria-label={t("recommendations.loadingAria")}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="h-8 w-56 animate-pulse rounded-xl bg-muted/70" />
          <div className="h-10 w-28 animate-pulse rounded-xl bg-muted/70" />
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <Card className="h-56 animate-pulse bg-muted/40" />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (error) {
    return (
      <Card variant="outline" className="border-destructive/30 bg-destructive/5 p-6">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-3 text-sm font-semibold text-primary transition hover:underline"
        >
          {t("recommendations.retry")}
        </button>
      </Card>
    );
  }

  return (
    <section className="motion-safe:animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("recommendations.title")}
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("recommendations.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-border/80 bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-interactive hover:border-primary/40 hover:bg-muted/50"
        >
          {t("recommendations.refresh")}
        </button>
      </div>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((s, idx) => (
          <li key={`${s.title}-${idx}`}>
            <RecipeCard
              variant="inspiration"
              title={s.title}
              description={s.rationale}
              ingredientHints={s.highlightIngredients}
              href="/cocinar"
              ctaLabel={t("recommendations.exploreCta")}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
