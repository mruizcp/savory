"use client";

import type { RecipeGenerationOutput } from "@/lib/ai/recipe-schema";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils/cn";

function difficultyLabel(
  code: string | null | undefined,
  t: (key: string) => string,
): string {
  if (!code) return "—";
  if (code === "EASY") return t("recipeCard.difficultyEasy");
  if (code === "MEDIUM") return t("recipeCard.difficultyMedium");
  if (code === "HARD") return t("recipeCard.difficultyHard");
  return code;
}

export type RecipeGenerationResultCardProps = {
  variant: "available" | "withMissing";
  sectionTitle: string;
  sectionSubtitle: string;
  recipe: RecipeGenerationOutput;
  detailHref: string | null;
};

export function RecipeGenerationResultCard({
  variant,
  sectionTitle,
  sectionSubtitle,
  recipe,
  detailHref,
}: RecipeGenerationResultCardProps) {
  const { t } = useI18n();
  const availableCount = recipe.ingredients.filter((i) => !i.isMissing).length;
  const missingCount = recipe.ingredients.filter((i) => i.isMissing).length;

  const stepsLabel =
    recipe.steps.length === 1
      ? t("recipeGeneration.stepOne")
      : t("recipeGeneration.stepsMany", { count: recipe.steps.length });

  const extraLabel =
    missingCount === 0
      ? null
      : missingCount === 1
        ? t("recipeGeneration.extraOne", { count: 1 })
        : t("recipeGeneration.extraMany", { count: missingCount });

  const viewLabel = t("recipeGeneration.viewRecipe");

  const card = (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden border-l-4 p-5 transition-interactive hover:shadow-elevate dark:hover:shadow-elevate-dark",
        variant === "available"
          ? "border-l-emerald-500"
          : "border-l-amber-500",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {sectionTitle}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {sectionSubtitle}
      </p>

      <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-foreground">
        {recipe.title}
      </h3>

      {recipe.description ? (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {recipe.description}
        </p>
      ) : null}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("recipeGeneration.time")}
          </dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {recipe.totalMinutes != null
              ? `${recipe.totalMinutes} ${t("recipeCard.minutesShort")}`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("recipeGeneration.level")}
          </dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {difficultyLabel(recipe.difficulty, t)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("recipeGeneration.calories")}
          </dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {recipe.calories != null ? `${recipe.calories} kcal` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("recipeGeneration.servings")}
          </dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {recipe.servings != null ? `${recipe.servings}` : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 rounded-2xl bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {t("recipeGeneration.ingredientsLine", {
            total: recipe.ingredients.length,
          })}
        </span>
        {" · "}
        <span className="text-emerald-700 dark:text-emerald-400">
          {t("recipeGeneration.inPantry", { count: availableCount })}
        </span>
        {missingCount > 0 && extraLabel ? (
          <>
            {" · "}
            <span className="text-amber-800 dark:text-amber-300">{extraLabel}</span>
          </>
        ) : null}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{stepsLabel}</p>

      <div className="mt-5 flex-1" />

      {detailHref ? (
        <div
          className={cn(
            "pointer-events-none mt-auto inline-flex min-h-12 w-full items-center justify-center rounded-xl text-sm font-semibold",
            "bg-primary text-primary-foreground shadow-sm group-hover:brightness-[1.03] dark:group-hover:brightness-110",
          )}
          aria-hidden
        >
          {viewLabel}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
          {t("recipeGeneration.pendingSave")}
        </p>
      )}
    </Card>
  );

  if (detailHref) {
    return (
      <Link
        href={detailHref}
        prefetch={false}
        scroll
        aria-label={`${recipe.title}. ${viewLabel}`}
        className={cn(
          "group block h-full rounded-2xl no-underline outline-none transition-interactive focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {card}
      </Link>
    );
  }

  return card;
}
