import { INGREDIENT_CATALOG, MAX_SUGGESTIONS } from "@/features/ingredients/constants";

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export function formatIngredient(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export function isSameIngredient(a: string, b: string): boolean {
  return normalize(a) === normalize(b);
}

export function includesIngredient(list: string[], candidate: string): boolean {
  return list.some((item) => isSameIngredient(item, candidate));
}

export function getIngredientSuggestions(query: string, selected: string[]): string[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  return INGREDIENT_CATALOG.filter((item) => {
    if (includesIngredient(selected, item)) return false;
    return item.includes(normalizedQuery);
  }).slice(0, MAX_SUGGESTIONS);
}
