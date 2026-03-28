import type { Locale } from "@/lib/i18n/constants";
import { recipeCard as recipeCardEn } from "@/lib/i18n/locales/en/recipeCard";
import { recipeCard as recipeCardEs } from "@/lib/i18n/locales/es/recipeCard";

/**
 * Textos de `recipeCard` sin pasar por `translate()`: evita que en runtime
 * se muestre la clave (p. ej. `recipeCard.favoriteAdd`) si el catálogo no resuelve.
 */
export function getRecipeCardMessages(locale: Locale) {
  return locale === "en" ? recipeCardEn : recipeCardEs;
}
