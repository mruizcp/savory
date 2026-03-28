"use client";

import type { ReactNode } from "react";

import type { RecipeGenerationOutput } from "@/lib/ai/recipe-schema";

import { RecipeGenerationResultCard } from "@/components/recipes/recipe-generation-result-card";
import { useI18n } from "@/lib/i18n/i18n-context";

export type RecipeSlot = {
  recipe: RecipeGenerationOutput;
  recipeId: string | null;
};

type RecipeResultsViewProps = {
  available: RecipeSlot;
  withMissing: RecipeSlot;
  footerAvailable?: ReactNode;
  footerWithMissing?: ReactNode;
};

export function RecipeResultsView({
  available,
  withMissing,
  footerAvailable,
  footerWithMissing,
}: RecipeResultsViewProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            {t("recipeResults.title")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("recipeResults.description")}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"
                aria-hidden
              />
              {t("recipeResults.legendGreen")}
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500"
                aria-hidden
              />
              {t("recipeResults.legendAmber")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="order-1 space-y-3">
          <RecipeGenerationResultCard
            variant="available"
            sectionTitle={t("recipeResults.availableTitle")}
            sectionSubtitle={t("recipeResults.availableSubtitle")}
            recipe={available.recipe}
            detailHref={
              available.recipeId
                ? `/recetas/${encodeURIComponent(available.recipeId)}`
                : null
            }
          />
          {footerAvailable}
        </div>
        <div className="order-2 space-y-3">
          <RecipeGenerationResultCard
            variant="withMissing"
            sectionTitle={t("recipeResults.suggestedTitle")}
            sectionSubtitle={t("recipeResults.suggestedSubtitle")}
            recipe={withMissing.recipe}
            detailHref={
              withMissing.recipeId
                ? `/recetas/${encodeURIComponent(withMissing.recipeId)}`
                : null
            }
          />
          {footerWithMissing}
        </div>
      </div>
    </div>
  );
}
