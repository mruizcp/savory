"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { RecipeDetailPayload } from "@/lib/recipes/recipe-detail-payload";
import {
  formatScaledNumber,
  getServingScaleFactor,
  scaleCalories,
  scaleQuantityText,
} from "@/lib/recipes/portion-scale";
import { cn } from "@/lib/utils/cn";

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: "Fácil",
  MEDIUM: "Media",
  HARD: "Difícil",
};

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 50;

type RecipeReadOnlyViewProps = {
  recipe: RecipeDetailPayload;
};

/**
 * Contenido de receta sin acciones de cuenta (favoritos, compartir, etc.).
 */
export function RecipeReadOnlyView({ recipe }: RecipeReadOnlyViewProps) {
  const [targetServings, setTargetServings] = useState(() =>
    Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, recipe.baseServings)),
  );

  const factor = useMemo(
    () => getServingScaleFactor(recipe.baseServings, targetServings),
    [recipe.baseServings, targetServings],
  );

  const scaledCalories = useMemo(
    () => scaleCalories(recipe.calories, factor),
    [recipe.calories, factor],
  );

  const scaledIngredients = useMemo(
    () =>
      recipe.ingredients.map((ing) => ({
        ...ing,
        displayQuantity: scaleQuantityText(ing.quantityText, factor),
      })),
    [recipe.ingredients, factor],
  );

  function bump(delta: number) {
    setTargetServings((prev) =>
      Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, prev + delta)),
    );
  }

  return (
    <div className="space-y-8">
      <section
        className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
        aria-labelledby="meta-heading"
      >
        <h2 id="meta-heading" className="sr-only">
          Resumen
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-muted/50 px-3 py-2.5">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tiempo total
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {recipe.totalMinutes != null ? `${recipe.totalMinutes} min` : "—"}
            </dd>
            <p className="mt-1 text-[11px] text-muted-foreground">
              No cambia al ajustar porciones (mismo proceso).
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 px-3 py-2.5">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Calorías (aprox.)
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">
              {scaledCalories != null ? `${scaledCalories} kcal` : "—"}
            </dd>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Escaladas según porciones.
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 px-3 py-2.5">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Dificultad
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {recipe.difficulty
                ? (DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty)
                : "—"}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/50 px-3 py-2.5 sm:col-span-2 lg:col-span-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Utensilios
            </dt>
            <dd className="mt-1 text-sm leading-snug">
              {recipe.utensils.length > 0
                ? recipe.utensils.join(", ")
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      {recipe.notes ? (
        <section
          className="rounded-2xl border border-border bg-card p-4 sm:p-5"
          aria-labelledby="notes-heading"
        >
          <h2
            id="notes-heading"
            className="text-base font-semibold tracking-tight"
          >
            Notas
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {recipe.notes}
          </p>
        </section>
      ) : null}

      <section
        className="rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5"
        aria-labelledby="portions-heading"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="portions-heading"
              className="text-base font-semibold tracking-tight"
            >
              Ajuste por porciones
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              La receta está pensada para{" "}
              <strong className="font-medium text-foreground">
                {recipe.baseServings}
              </strong>{" "}
              {recipe.baseServings === 1 ? "porción" : "porciones"}. Cambia el
              número para escalar ingredientes y calorías.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="min-w-11 px-3"
              onClick={() => bump(-1)}
              disabled={targetServings <= MIN_SERVINGS}
              aria-label="Menos una porción"
            >
              −
            </Button>
            <label className="flex items-center gap-2 text-sm">
              <span className="sr-only">Porciones deseadas</span>
              <input
                type="number"
                min={MIN_SERVINGS}
                max={MAX_SERVINGS}
                value={targetServings}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (Number.isNaN(v)) return;
                  setTargetServings(
                    Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, v)),
                  );
                }}
                className="w-16 rounded-lg border border-border bg-background px-2 py-2 text-center text-base font-semibold tabular-nums outline-none ring-accent focus-visible:ring-2"
              />
              <span className="text-muted-foreground">porciones</span>
            </label>
            <Button
              type="button"
              variant="secondary"
              className="min-w-11 px-3"
              onClick={() => bump(1)}
              disabled={targetServings >= MAX_SERVINGS}
              aria-label="Más una porción"
            >
              +
            </Button>
          </div>
        </div>
        {Math.abs(factor - 1) > 0.001 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Factor de escala: ×{formatScaledNumber(factor)} (objetivo ÷ base)
          </p>
        )}
      </section>

      <section aria-labelledby="ingredients-heading">
        <h2
          id="ingredients-heading"
          className="text-base font-semibold tracking-tight"
        >
          Ingredientes
        </h2>
        <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
          {scaledIngredients.map((ing) => (
            <li
              key={ing.id}
              className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-3 text-sm first:rounded-t-xl last:rounded-b-xl odd:bg-muted/30"
            >
              <span className="font-medium">{ing.name}</span>
              <span
                className={cn(
                  "text-right text-muted-foreground",
                  ing.isMissing && "text-amber-800 dark:text-amber-300",
                )}
              >
                {ing.displayQuantity ?? "al gusto"}
                {ing.isMissing ? (
                  <span className="ml-2 text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-400">
                    sugerido
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-heading">
        <h2
          id="steps-heading"
          className="text-base font-semibold tracking-tight"
        >
          Pasos
        </h2>
        <ol className="mt-4 space-y-4">
          {recipe.steps
            .slice()
            .sort((a, b) => a.stepNumber - b.stepNumber)
            .map((step) => (
              <li key={step.stepNumber} className="flex gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                  aria-hidden
                >
                  {step.stepNumber}
                </span>
                <p className="min-w-0 flex-1 pt-1 text-sm leading-relaxed">
                  {step.instruction}
                </p>
              </li>
            ))}
        </ol>
      </section>
    </div>
  );
}
