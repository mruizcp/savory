"use client";

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

export type RecipeCardSavedRecipe = {
  id: string;
  title: string;
  totalMinutes: number | null;
  calories: number | null;
  difficulty: string | null;
  missingIngredientNames: string[];
};

export type RecipeCardProps =
  | {
      variant: "saved";
      recipe: RecipeCardSavedRecipe;
      className?: string;
    }
  | {
      variant: "inspiration";
      title: string;
      description: string;
      ingredientHints: string[];
      href: string;
      ctaLabel?: string;
      className?: string;
    };

export function RecipeCard(props: RecipeCardProps) {
  const { t } = useI18n();

  if (props.variant === "saved") {
    const { recipe, className } = props;
    const missingPreview = recipe.missingIngredientNames.slice(0, 4);
    const extra =
      recipe.missingIngredientNames.length > missingPreview.length
        ? recipe.missingIngredientNames.length - missingPreview.length
        : 0;
    const hasMissing = recipe.missingIngredientNames.length > 0;
    const detailHref = `/recetas/${encodeURIComponent(recipe.id)}`;

    return (
      <Link
        href={detailHref}
        prefetch={false}
        scroll
        aria-label={`${recipe.title}. ${t("recipeCard.viewRecipe")}`}
        className={cn(
          "group block h-full rounded-2xl no-underline outline-none transition-interactive focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
      <Card
        className={cn(
          "flex h-full flex-col p-5 hover:shadow-elevate dark:hover:shadow-elevate-dark",
        )}
      >
        <div className="flex min-h-[3rem] items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-snug tracking-tight text-foreground transition group-hover:text-primary">
            {recipe.title}
          </h3>
          {hasMissing ? (
            <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
              {t("recipeCard.missingBadge", {
                count: recipe.missingIngredientNames.length,
              })}
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100">
              {t("recipeCard.ready")}
            </span>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("recipeCard.time")}
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {recipe.totalMinutes != null
                ? `${recipe.totalMinutes} ${t("recipeCard.minutesShort")}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("recipeCard.level")}
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {difficultyLabel(recipe.difficulty, t)}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("recipeCard.calories")}
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {recipe.calories != null ? `${recipe.calories} kcal` : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-3 min-h-[2.5rem] flex-1">
          {hasMissing ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/90">
                {t("recipeCard.missingIntro")}{" "}
              </span>
              {missingPreview.join(", ")}
              {extra > 0 ? ` ${t("recipeCard.missingMore", { count: extra })}` : ""}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{t("recipeCard.covered")}</p>
          )}
        </div>

        <div
          className={cn(
            "pointer-events-none mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl text-sm font-semibold",
            "bg-primary text-primary-foreground shadow-sm group-hover:brightness-[1.03] dark:group-hover:brightness-110",
          )}
          aria-hidden
        >
          {t("recipeCard.viewRecipe")}
        </div>
      </Card>
      </Link>
    );
  }

  const {
    title,
    description,
    ingredientHints,
    href,
    ctaLabel,
    className,
  } = props;

  const inspirationCta = ctaLabel ?? t("recipeCard.goToRecipes");
  const safeHref = href.startsWith("/") ? href : `/${href}`;

  return (
    <Link
      href={safeHref}
      prefetch={false}
      scroll
      aria-label={`${title}. ${inspirationCta}`}
      className={cn(
        "group block h-full rounded-2xl no-underline outline-none transition-interactive focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Card
        className={cn(
          "flex h-full flex-col p-5 hover:border-primary/25 hover:shadow-elevate dark:hover:shadow-elevate-dark",
        )}
      >
        <h3 className="font-semibold leading-snug tracking-tight text-foreground transition group-hover:text-primary">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">
            {t("recipeCard.withIngredients")}{" "}
          </span>
          {ingredientHints.join(", ")}
        </p>
        <div
          className={cn(
            "pointer-events-none mt-5 inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-semibold",
            "bg-primary text-primary-foreground shadow-sm group-hover:brightness-[1.03] dark:group-hover:brightness-110",
          )}
          aria-hidden
        >
          {inspirationCta}
        </div>
      </Card>
    </Link>
  );
}
