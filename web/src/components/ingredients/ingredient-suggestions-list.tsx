"use client";

import { cn } from "@/lib/utils/cn";

type IngredientSuggestionsListProps = {
  suggestions: string[];
  highlightedIndex: number;
  onSelect: (ingredient: string) => void;
  onHover: (index: number) => void;
};

export function IngredientSuggestionsList({
  suggestions,
  highlightedIndex,
  onSelect,
  onHover,
}: IngredientSuggestionsListProps) {
  if (suggestions.length === 0) return null;

  return (
    <ul
      className="mt-2 max-h-64 overflow-auto rounded-2xl border border-border/80 bg-card p-1.5 shadow-soft"
      role="listbox"
      aria-label="Sugerencias de ingredientes"
    >
      {suggestions.map((ingredient, index) => (
        <li key={ingredient}>
          <button
            type="button"
            className={cn(
              "flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm transition-colors",
              highlightedIndex === index
                ? "bg-primary/10 font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
            onMouseEnter={() => onHover(index)}
            onClick={() => onSelect(ingredient)}
            role="option"
            aria-selected={highlightedIndex === index}
          >
            {ingredient}
          </button>
        </li>
      ))}
    </ul>
  );
}
