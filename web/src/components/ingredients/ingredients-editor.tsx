"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { IngredientSuggestionsList } from "@/components/ingredients/ingredient-suggestions-list";
import { SelectedIngredientsChips } from "@/components/ingredients/selected-ingredients-chips";
import { Button } from "@/components/ui/button";
import {
  formatIngredient,
  getIngredientSuggestions,
  includesIngredient,
} from "@/features/ingredients";
import { useI18n } from "@/lib/i18n/i18n-context";

/** Misma referencia siempre; nunca usar `= []` en props por defecto (nuevo [] cada render → bucle infinito). */
const EMPTY_INGREDIENTS: string[] = [];

function stableIngredientsKey(list: string[]): string {
  return JSON.stringify(
    [...list]
      .map((s) => s.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "es")),
  );
}

type IngredientsEditorProps = {
  initialIngredients?: string[];
  emptyMessage?: string;
  listHeading?: string;
  inputPlaceholder?: string;
  onChange?: (ingredients: string[]) => void;
};

export function IngredientsEditor({
  initialIngredients,
  emptyMessage,
  listHeading,
  inputPlaceholder,
  onChange,
}: IngredientsEditorProps) {
  const { t } = useI18n();
  const listHeadingResolved = listHeading ?? t("ingredients.editorListHeading");
  const placeholderResolved =
    inputPlaceholder ?? t("ingredients.editorPlaceholder");

  const initialList = initialIngredients ?? EMPTY_INGREDIENTS;
  const initialKey = stableIngredientsKey(initialList);

  const [query, setQuery] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(
    () => [...initialList],
  );
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [message, setMessage] = useState<string | null>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setSelectedIngredients([...initialList]);
  }, [initialKey]);

  useEffect(() => {
    onChangeRef.current?.(selectedIngredients);
  }, [selectedIngredients]);

  const suggestions = useMemo(
    () => getIngredientSuggestions(query, selectedIngredients),
    [query, selectedIngredients],
  );

  function addIngredient(rawValue: string) {
    const formatted = formatIngredient(rawValue);
    if (!formatted) return;

    if (includesIngredient(selectedIngredients, formatted)) {
      setMessage(t("ingredients.editorDuplicate"));
      return;
    }

    setSelectedIngredients((current) => [...current, formatted]);
    setQuery("");
    setHighlightedIndex(-1);
    setMessage(null);
  }

  function removeIngredient(ingredient: string) {
    setSelectedIngredients((current) =>
      current.filter((item) => item.toLowerCase() !== ingredient.toLowerCase()),
    );
    setMessage(null);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (suggestions.length === 0) return;
      setHighlightedIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : 0,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (suggestions.length === 0) return;
      setHighlightedIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        addIngredient(suggestions[highlightedIndex]);
        return;
      }
      addIngredient(query);
    }
  }

  return (
    <div className="mt-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlightedIndex(-1);
          }}
          onKeyDown={onInputKeyDown}
          placeholder={placeholderResolved}
          className="min-h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          autoComplete="off"
          aria-label={t("ingredients.editorPlaceholder")}
        />
        <Button
          type="button"
          size="lg"
          className="shrink-0"
          onClick={() => addIngredient(query)}
        >
          {t("ingredients.editorAdd")}
        </Button>
      </div>

      <IngredientSuggestionsList
        suggestions={suggestions}
        highlightedIndex={highlightedIndex}
        onHover={setHighlightedIndex}
        onSelect={addIngredient}
      />

      {message ? (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{message}</p>
      ) : null}

      <div className="mt-4">
        <p className="mb-3 text-sm font-semibold tracking-tight text-foreground">
          {listHeadingResolved}
        </p>
        <SelectedIngredientsChips
          ingredients={selectedIngredients}
          onRemove={removeIngredient}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
}
