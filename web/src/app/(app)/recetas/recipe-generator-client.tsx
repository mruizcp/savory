"use client";

import { useEffect, useState } from "react";

import { RecipeResultsView } from "@/components/recipes/recipe-results-view";
import type { RecipeSlot } from "@/components/recipes/recipe-results-view";
import { Button } from "@/components/ui/button";
import type { RecipeGenerationOutput } from "@/lib/ai/recipe-schema";

type Props = {
  canPersist: boolean;
  /** Lista de despensa (foto + manual); sincroniza el área de texto para generar. */
  syncedIngredientList?: string[];
};

type PairApiResponse = {
  WITH_AVAILABLE?: { recipe: RecipeGenerationOutput; recipeId: string | null };
  WITH_MISSING?: { recipe: RecipeGenerationOutput; recipeId: string | null };
  error?: string;
};

type SingleApiResponse = {
  recipe?: RecipeGenerationOutput;
  recipeId?: string | null;
  error?: string;
};

export function RecipeGeneratorClient({
  canPersist,
  syncedIngredientList,
}: Props) {
  const [ingredientsText, setIngredientsText] = useState("");

  useEffect(() => {
    if (!syncedIngredientList?.length) return;
    setIngredientsText(syncedIngredientList.join(", "));
  }, [syncedIngredientList]);
  const [regenerateHint, setRegenerateHint] = useState("");
  const [pairLoading, setPairLoading] = useState(false);
  const [singleLoading, setSingleLoading] = useState<
    "WITH_AVAILABLE" | "WITH_MISSING" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [slotAvailable, setSlotAvailable] = useState<RecipeSlot | null>(null);
  const [slotWithMissing, setSlotWithMissing] = useState<RecipeSlot | null>(
    null,
  );

  const ingredientsList = ingredientsText
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const busy = pairLoading || singleLoading !== null;

  async function callGeneratePair() {
    setPairLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recipes/generate-pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredientsList }),
      });
      const data = (await res.json()) as PairApiResponse;
      if (!res.ok) {
        setError(data.error ?? "No se pudieron generar las recetas.");
        return;
      }
      if (!data.WITH_AVAILABLE?.recipe || !data.WITH_MISSING?.recipe) {
        setError("Respuesta incompleta del servidor.");
        return;
      }
      setSlotAvailable({
        recipe: data.WITH_AVAILABLE.recipe,
        recipeId: data.WITH_AVAILABLE.recipeId ?? null,
      });
      setSlotWithMissing({
        recipe: data.WITH_MISSING.recipe,
        recipeId: data.WITH_MISSING.recipeId ?? null,
      });
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setPairLoading(false);
    }
  }

  async function callGenerateSingle(params: {
    generationType: "WITH_AVAILABLE" | "WITH_MISSING";
    parentRecipeId: string | null;
  }) {
    setSingleLoading(params.generationType);
    setError(null);
    try {
      const res = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ingredientsList,
          generationType: params.generationType,
          parentRecipeId: params.parentRecipeId,
          regenerateHint: regenerateHint.trim() || null,
        }),
      });
      const data = (await res.json()) as SingleApiResponse;
      if (!res.ok) {
        setError(data.error ?? "No se pudo regenerar la receta.");
        return;
      }
      if (!data.recipe) {
        setError("Respuesta inesperada del servidor.");
        return;
      }
      const next: RecipeSlot = {
        recipe: data.recipe,
        recipeId: data.recipeId ?? null,
      };
      if (params.generationType === "WITH_AVAILABLE") {
        setSlotAvailable(next);
      } else {
        setSlotWithMissing(next);
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSingleLoading(null);
    }
  }

  function handleRegenerateAvailable() {
    if (!slotAvailable?.recipeId) {
      setError(
        canPersist
          ? "Genera primero las dos ideas para poder regenerar esta columna."
          : "Sin base de datos no se guarda el vínculo para regenerar. Vuelve a generar el par.",
      );
      return;
    }
    void callGenerateSingle({
      generationType: "WITH_AVAILABLE",
      parentRecipeId: slotAvailable.recipeId,
    });
  }

  function handleRegenerateWithMissing() {
    if (!slotWithMissing?.recipeId) {
      setError(
        canPersist
          ? "Genera primero las dos ideas para poder regenerar esta columna."
          : "Sin base de datos no se guarda el vínculo para regenerar. Vuelve a generar el par.",
      );
      return;
    }
    void callGenerateSingle({
      generationType: "WITH_MISSING",
      parentRecipeId: slotWithMissing.recipeId,
    });
  }

  const showResults = slotAvailable && slotWithMissing;

  return (
    <div className="mt-8 space-y-10">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold tracking-tight">
          Tus ingredientes
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Obtendrás{" "}
          <strong className="font-medium text-foreground">
            dos propuestas en paralelo
          </strong>
          : una priorizando solo lo que tienes y otra que puede sugerir pocos
          extras.{" "}
          {!canPersist && (
            <span className="text-amber-700 dark:text-amber-500">
              Sin base de datos, la regeneración por columna no está disponible.
            </span>
          )}
        </p>

        <label className="mt-4 block text-sm font-medium" htmlFor="ingredients">
          Ingredientes
        </label>
        <textarea
          id="ingredients"
          rows={4}
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          placeholder="Ej: pollo, cebolla, arroz, ajo"
          className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-accent focus-visible:ring-2"
        />

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => void callGeneratePair()}
            disabled={busy || ingredientsList.length === 0}
          >
            {pairLoading ? "Generando dos ideas…" : "Generar ideas"}
          </Button>
        </div>

        <div className="mt-6">
          <label
            className="text-sm font-medium"
            htmlFor="regenerate-hint"
          >
            Indicación al regenerar una columna (opcional)
          </label>
          <input
            id="regenerate-hint"
            type="text"
            value={regenerateHint}
            onChange={(e) => setRegenerateHint(e.target.value)}
            placeholder="Ej: más rápida, sin horno, menos picante"
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-accent focus-visible:ring-2"
          />
        </div>

        {error && (
          <p
            className="mt-4 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </section>

      {showResults && (
        <RecipeResultsView
          available={slotAvailable}
          withMissing={slotWithMissing}
          footerAvailable={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Nueva variante solo para la columna verde (mantiene la otra).
              </p>
              <Button
                type="button"
                variant="secondary"
                className="w-full shrink-0 sm:w-auto"
                disabled={
                  busy ||
                  !canPersist ||
                  !slotAvailable.recipeId ||
                  singleLoading === "WITH_AVAILABLE"
                }
                onClick={handleRegenerateAvailable}
              >
                {singleLoading === "WITH_AVAILABLE"
                  ? "Regenerando…"
                  : "Regenerar esta opción"}
              </Button>
            </div>
          }
          footerWithMissing={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Nueva variante solo para la columna ámbar (mantiene la otra).
              </p>
              <Button
                type="button"
                variant="secondary"
                className="w-full shrink-0 sm:w-auto"
                disabled={
                  busy ||
                  !canPersist ||
                  !slotWithMissing.recipeId ||
                  singleLoading === "WITH_MISSING"
                }
                onClick={handleRegenerateWithMissing}
              >
                {singleLoading === "WITH_MISSING"
                  ? "Regenerando…"
                  : "Regenerar esta opción"}
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
}
