"use client";

import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils/cn";

type SelectedIngredientsChipsProps = {
  ingredients: string[];
  onRemove: (ingredient: string) => void;
  emptyMessage?: string;
};

export function SelectedIngredientsChips({
  ingredients,
  onRemove,
  emptyMessage = "Aún no hay ingredientes en tu lista.",
}: SelectedIngredientsChipsProps) {
  if (ingredients.length === 0) {
    return (
      <p
        className={cn(
          "rounded-2xl border border-dashed border-border/90 bg-muted/25 px-4 py-10 text-center text-sm leading-relaxed text-muted-foreground",
          "transition-interactive",
        )}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul
      className="flex flex-wrap gap-2"
      aria-label="Ingredientes seleccionados"
    >
      {ingredients.map((ingredient) => (
        <li key={ingredient}>
          <Chip
            variant="primary"
            onRemove={() => onRemove(ingredient)}
            removeLabel={`Quitar ${ingredient}`}
          >
            {ingredient}
          </Chip>
        </li>
      ))}
    </ul>
  );
}
