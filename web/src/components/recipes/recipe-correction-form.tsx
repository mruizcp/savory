"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import type { RecipeDetailPayload } from "@/lib/recipes/recipe-detail-payload";
import { cn } from "@/lib/utils/cn";

type DraftIngredient = {
  name: string;
  quantityText: string;
  isMissing: boolean;
};

type DraftStep = {
  stepNumber: number;
  instruction: string;
};

type Props = {
  recipe: RecipeDetailPayload;
  onCancel: () => void;
  onSaved: (newRecipeId: string) => void;
};

const fieldClass =
  "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-base outline-none ring-accent focus-visible:ring-2 sm:text-sm";

function parseUtensils(raw: string): string[] {
  return raw
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function RecipeCorrectionForm({ recipe, onCancel, onSaved }: Props) {
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description ?? "");
  const [notes, setNotes] = useState(recipe.notes ?? "");
  const [servings, setServings] = useState(String(recipe.baseServings));
  const [totalMinutes, setTotalMinutes] = useState(
    recipe.totalMinutes != null ? String(recipe.totalMinutes) : "",
  );
  const [calories, setCalories] = useState(
    recipe.calories != null ? String(recipe.calories) : "",
  );
  const [difficulty, setDifficulty] = useState(recipe.difficulty ?? "");
  const [utensilsRaw, setUtensilsRaw] = useState(
    recipe.utensils.length > 0 ? recipe.utensils.join("\n") : "",
  );
  const [ingredients, setIngredients] = useState<DraftIngredient[]>(() =>
    recipe.ingredients.map((ing) => ({
      name: ing.name,
      quantityText: ing.quantityText ?? "",
      isMissing: ing.isMissing,
    })),
  );
  const [steps, setSteps] = useState<DraftStep[]>(() =>
    [...recipe.steps]
      .sort((a, b) => a.stepNumber - b.stepNumber)
      .map((s) => ({ stepNumber: s.stepNumber, instruction: s.instruction })),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateIngredient = useCallback(
    (index: number, patch: Partial<DraftIngredient>) => {
      setIngredients((prev) =>
        prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
      );
    },
    [],
  );

  const addIngredient = useCallback(() => {
    setIngredients((prev) => [
      ...prev,
      { name: "", quantityText: "", isMissing: false },
    ]);
  }, []);

  const removeIngredient = useCallback((index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateStep = useCallback((index: number, instruction: string) => {
    setSteps((prev) =>
      prev.map((row, i) => (i === index ? { ...row, instruction } : row)),
    );
  }, []);

  const addStep = useCallback(() => {
    setSteps((prev) => [
      ...prev,
      { stepNumber: prev.length + 1, instruction: "" },
    ]);
  }, []);

  const removeStep = useCallback((index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const servingsNum = parseInt(servings, 10);
    if (Number.isNaN(servingsNum) || servingsNum < 1 || servingsNum > 50) {
      setError("Indica porciones entre 1 y 50.");
      return;
    }

    const cleanedIngredients = ingredients
      .map((ing) => ({
        name: ing.name.trim(),
        quantityText: ing.quantityText.trim() || null,
        isMissing: ing.isMissing,
      }))
      .filter((ing) => ing.name.length > 0);

    if (cleanedIngredients.length === 0) {
      setError("Añade al menos un ingrediente con nombre.");
      return;
    }

    const cleanedSteps = steps
      .map((s) => ({ ...s, instruction: s.instruction.trim() }))
      .filter((s) => s.instruction.length > 0);

    if (cleanedSteps.length === 0) {
      setError("Añade al menos un paso con instrucción.");
      return;
    }

    let totalMin: number | null = null;
    if (totalMinutes.trim()) {
      const n = parseInt(totalMinutes, 10);
      if (Number.isNaN(n) || n < 1) {
        setError("Tiempo total inválido.");
        return;
      }
      totalMin = n;
    }

    let cal: number | null = null;
    if (calories.trim()) {
      const n = parseInt(calories, 10);
      if (Number.isNaN(n) || n < 0) {
        setError("Calorías inválidas.");
        return;
      }
      cal = n;
    }

    const diff =
      difficulty === "EASY" || difficulty === "MEDIUM" || difficulty === "HARD"
        ? difficulty
        : null;

    const body = {
      title: title.trim(),
      description: description.trim() || null,
      notes: notes.trim() || null,
      servings: servingsNum,
      totalMinutes: totalMin,
      calories: cal,
      difficulty: diff,
      utensils: parseUtensils(utensilsRaw),
      ingredients: cleanedIngredients,
      steps: cleanedSteps.map((s, i) => ({
        stepNumber: i + 1,
        instruction: s.instruction,
      })),
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { recipeId?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar la corrección.");
        return;
      }
      if (data.recipeId) {
        onSaved(data.recipeId);
      }
    } catch {
      setError("Error de red.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Se creará una <strong className="text-foreground">nueva versión</strong>{" "}
        guardada; la receta actual no se modifica. Podrás seguir abriendo esta
        desde el historial o enlaces antiguos.
      </p>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <div>
        <label className="text-sm font-medium" htmlFor="corr-title">
          Título
        </label>
        <input
          id="corr-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(fieldClass, "min-h-11")}
          required
          maxLength={180}
        />
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="corr-desc">
          Descripción
        </label>
        <textarea
          id="corr-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={fieldClass}
          maxLength={2000}
        />
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="corr-notes">
          Notas
        </label>
        <textarea
          id="corr-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Tips, sustituciones, advertencias alergias…"
          className={fieldClass}
          maxLength={2000}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="corr-servings">
            Porciones
          </label>
          <input
            id="corr-servings"
            type="number"
            min={1}
            max={50}
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className={cn(fieldClass, "min-h-11 tabular-nums")}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="corr-time">
            Tiempo total (min)
          </label>
          <input
            id="corr-time"
            type="number"
            min={1}
            value={totalMinutes}
            onChange={(e) => setTotalMinutes(e.target.value)}
            placeholder="Opcional"
            className={cn(fieldClass, "min-h-11 tabular-nums")}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="corr-cal">
            Calorías (aprox.)
          </label>
          <input
            id="corr-cal"
            type="number"
            min={0}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Opcional"
            className={cn(fieldClass, "min-h-11 tabular-nums")}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="corr-diff">
            Dificultad
          </label>
          <select
            id="corr-diff"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={cn(fieldClass, "min-h-11")}
          >
            <option value="">Sin especificar</option>
            <option value="EASY">Fácil</option>
            <option value="MEDIUM">Media</option>
            <option value="HARD">Difícil</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="corr-utensils">
          Utensilios (uno por línea o separados por coma)
        </label>
        <textarea
          id="corr-utensils"
          value={utensilsRaw}
          onChange={(e) => setUtensilsRaw(e.target.value)}
          rows={2}
          className={fieldClass}
        />
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Ingredientes</h3>
          <Button type="button" variant="secondary" onClick={addIngredient}>
            Añadir
          </Button>
        </div>
        <ul className="mt-3 space-y-3">
          {ingredients.map((ing, index) => (
            <li
              key={index}
              className="rounded-xl border border-border bg-card p-3 sm:grid sm:grid-cols-12 sm:gap-2"
            >
              <div className="sm:col-span-5">
                <label className="sr-only" htmlFor={`ing-name-${index}`}>
                  Nombre
                </label>
                <input
                  id={`ing-name-${index}`}
                  value={ing.name}
                  onChange={(e) =>
                    updateIngredient(index, { name: e.target.value })
                  }
                  placeholder="Ingrediente"
                  className={cn(fieldClass, "min-h-11")}
                />
              </div>
              <div className="mt-2 sm:col-span-4 sm:mt-0">
                <label className="sr-only" htmlFor={`ing-qty-${index}`}>
                  Cantidad
                </label>
                <input
                  id={`ing-qty-${index}`}
                  value={ing.quantityText}
                  onChange={(e) =>
                    updateIngredient(index, { quantityText: e.target.value })
                  }
                  placeholder="Cantidad"
                  className={cn(fieldClass, "min-h-11")}
                />
              </div>
              <div className="mt-2 flex items-center gap-3 sm:col-span-3 sm:mt-0">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={ing.isMissing}
                    onChange={(e) =>
                      updateIngredient(index, { isMissing: e.target.checked })
                    }
                  />
                  Sugerido / falta
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length <= 1}
                >
                  Quitar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Pasos</h3>
          <Button type="button" variant="secondary" onClick={addStep}>
            Añadir paso
          </Button>
        </div>
        <ol className="mt-3 space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-2">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
                aria-hidden
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <label className="sr-only" htmlFor={`step-${index}`}>
                  Paso {index + 1}
                </label>
                <textarea
                  id={`step-${index}`}
                  value={step.instruction}
                  onChange={(e) => updateStep(index, e.target.value)}
                  rows={2}
                  className={fieldClass}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-1 text-destructive"
                  onClick={() => removeStep(index)}
                  disabled={steps.length <= 1}
                >
                  Quitar paso
                </Button>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="submit" disabled={saving} className="min-h-11 sm:w-auto">
          {saving ? "Guardando…" : "Guardar nueva versión"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 sm:w-auto"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
