/**
 * Valores alineados con canvas: filtros en explorar recetas.
 * Códigos en MAYÚSCULAS_SIN_ESPACIOS para API y BD.
 */

export const RECIPE_MEAL_TYPES = [
  { code: "DESAYUNO", label: "Desayuno" },
  { code: "ALMUERZO", label: "Almuerzo / comida" },
  { code: "CENA", label: "Cena" },
  { code: "SNACK", label: "Snack / merienda" },
  { code: "POSTRE", label: "Postre" },
  { code: "SOPA", label: "Sopa / caldo" },
  { code: "PLATO_FUERTE", label: "Plato fuerte" },
  { code: "ACOMPANAMIENTO", label: "Acompañamiento" },
  { code: "OTRO", label: "Otro" },
] as const;

export type RecipeMealTypeCode = (typeof RECIPE_MEAL_TYPES)[number]["code"];

export const RECIPE_DIET_TAGS = [
  { code: "VEGETARIANO", label: "Vegetariano" },
  { code: "VEGANO", label: "Vegano" },
  { code: "SIN_GLUTEN", label: "Sin gluten" },
  { code: "SIN_LACTOSA", label: "Sin lactosa" },
  { code: "BAJO_EN_CARBOHIDRATOS", label: "Bajo en carbohidratos" },
  { code: "KETO", label: "Keto" },
  { code: "SIN_FRUTOS_SECOS", label: "Sin frutos secos" },
  { code: "SIN_MARISCOS", label: "Sin mariscos" },
  { code: "OTRO", label: "Otra / varias" },
] as const;

export type RecipeDietTagCode = (typeof RECIPE_DIET_TAGS)[number]["code"];

export const RECIPE_MAX_MINUTES_PRESETS = [
  { value: "", label: "Cualquier tiempo" },
  { value: "30", label: "Hasta 30 min" },
  { value: "45", label: "Hasta 45 min" },
  { value: "60", label: "Hasta 1 h" },
  { value: "90", label: "Hasta 1 h 30" },
  { value: "120", label: "Hasta 2 h" },
] as const;

export const RECIPE_DIFFICULTY_FILTER = [
  { value: "", label: "Cualquier dificultad" },
  { value: "EASY", label: "Fácil" },
  { value: "MEDIUM", label: "Media" },
  { value: "HARD", label: "Difícil" },
] as const;

/** Formato BD: ,CODE1,CODE2, para filtrar con contains `,CODE,` */
export function formatDietTagsForDb(tags: string[] | undefined): string | null {
  if (!tags?.length) return null;
  const normalized = [
    ...new Set(tags.map((t) => t.trim().toUpperCase()).filter(Boolean)),
  ];
  if (normalized.length === 0) return null;
  return `,${normalized.join(",")},`;
}

export function parseDietTagsFromDb(csv: string | null | undefined): string[] {
  if (!csv?.trim()) return [];
  return csv
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}
