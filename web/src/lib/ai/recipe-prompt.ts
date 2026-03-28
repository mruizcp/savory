import { formatProfileForRecipePrompt } from "@/lib/ai/profile-for-prompt";
import type { RecipeGenerationOutput } from "@/lib/ai/recipe-schema";
import type { UserProfileInput } from "@/features/profile";

/** Versión del prompt para trazabilidad en DB (`RecipeGenerationAttempt.promptVersion`). */
export const RECIPE_PROMPT_VERSION = "recipe-json-v1";

/**
 * Prompt de sistema: fuerza JSON único, español, y reglas de negocio del producto.
 */
export const RECIPE_SYSTEM_PROMPT = `Eres un asistente culinario para la app "Savory".
Tu salida debe ser SIEMPRE un único objeto JSON válido (sin markdown, sin texto antes ni después).
Idioma: español (latinoamericano).

Reglas:
1) Prioriza usar los ingredientes que el usuario indica como disponibles.
2) Puedes marcar ingredientes como faltantes (isMissing: true) solo si son pocos y comunes para completar el plato; si no hay alternativa razonable, prioriza recetas con lo disponible.
3) La receta debe ser realista para cocina casera: pasos claros, ordenados, tiempos creíbles.
4) difficulty debe ser uno de: EASY, MEDIUM, HARD.
5) utensils es un array de strings (utensilios necesarios).
6) ingredients: cada item tiene name, quantityText (opcional o null), isMissing (boolean).
7) steps: cada paso tiene stepNumber empezando en 1 y consecutivo, e instruction con texto completo.
8) totalMinutes es tiempo total estimado en minutos; calories es estimación aproximada (entero) o null si no puedes estimar con seguridad.
9) mealType (opcional): clasifica el plato con UN valor del listado del esquema JSON (p. ej. DESAYUNO, CENA, POSTRE). Si no aplica, omite el campo o usa null.
10) dietTags (opcional): array de 0 a 5 etiquetas del listado del esquema (p. ej. VEGETARIANO, SIN_GLUTEN) que describan restricciones que cumple la receta; solo si estás razonablemente seguro; si no aplica, omítelo o usa [].
11) No incluyas otros campos fuera del esquema JSON indicado abajo.
12) Si el mensaje del usuario incluye un bloque "Perfil del usuario", respétalo: restricciones dietéticas, ingredientes a evitar, nivel de cocina y objetivos, siempre que sea compatible con los ingredientes disponibles indicados.`;

export type GenerationMode = "WITH_AVAILABLE" | "WITH_MISSING";

export function buildRecipeJsonSchemaDescription(): string {
  return `El JSON debe tener exactamente esta forma (tipos indicativos):
{
  "title": string,
  "description": string | null,
  "servings": number | null,
  "totalMinutes": number | null,
  "calories": number | null,
  "difficulty": "EASY" | "MEDIUM" | "HARD" | null,
  "mealType": "DESAYUNO" | "ALMUERZO" | "CENA" | "SNACK" | "POSTRE" | "SOPA" | "PLATO_FUERTE" | "ACOMPANAMIENTO" | "OTRO" | null,
  "dietTags": ("VEGETARIANO" | "VEGANO" | "SIN_GLUTEN" | "SIN_LACTOSA" | "BAJO_EN_CARBOHIDRATOS" | "KETO" | "SIN_FRUTOS_SECOS" | "SIN_MARISCOS" | "OTRO")[],
  "utensils": string[],
  "ingredients": { "name": string, "quantityText": string | null, "isMissing": boolean }[],
  "steps": { "stepNumber": number, "instruction": string }[]
}
mealType y dietTags son opcionales; puedes omitirlos si no aplicas clasificación.`;
}

export function buildUserRecipePrompt(params: {
  ingredients: string[];
  generationType: GenerationMode;
  parentRecipe?: RecipeGenerationOutput | null;
  regenerateHint?: string | null;
  /** Perfil guardado (dietas, objetivos, ingredientes a evitar, nivel). */
  profile?: UserProfileInput | null;
}): string {
  const list = params.ingredients.map((s) => `- ${s.trim()}`).filter(Boolean).join("\n");
  const modeLine =
    params.generationType === "WITH_AVAILABLE"
      ? "Modo: solo usa ingredientes disponibles (no inventes ingredientes faltantes salvo que sean imprescindibles y márcalos con isMissing)."
      : "Modo: permite sugerir hasta unos pocos ingredientes faltantes comunes marcándolos con isMissing: true.";

  let parentBlock = "";
  if (params.parentRecipe) {
    const prev = JSON.stringify(params.parentRecipe);
    parentBlock = `
Receta anterior (debes generar una variante distinta, no solo copiar; cambia enfoque o técnica):
${prev.slice(0, 6000)}
`;
  }

  const hint = params.regenerateHint?.trim()
    ? `\nIndicación adicional del usuario: ${params.regenerateHint.trim()}`
    : "";

  const profileBlock =
    params.profile != null
      ? `\n${formatProfileForRecipePrompt(params.profile)}\n`
      : "";

  return `${buildRecipeJsonSchemaDescription()}

Ingredientes disponibles (lista del usuario):
${list || "(vacío)"}

${modeLine}
${profileBlock}${parentBlock}
${hint}

Responde solo con el objeto JSON.`;
}
