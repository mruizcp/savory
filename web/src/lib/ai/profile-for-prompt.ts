import type { UserProfileInput } from "@/features/profile";
import { COOKING_LEVEL_OPTIONS } from "@/features/profile/constants";

/**
 * Texto en español para el prompt de generación de recetas (no incluye PII).
 */
export function formatProfileForRecipePrompt(profile: UserProfileInput): string {
  const levelLabel =
    COOKING_LEVEL_OPTIONS.find((o) => o.value === profile.cookingLevel)
      ?.label ?? profile.cookingLevel;

  const lines: string[] = [`- Nivel de cocina: ${levelLabel}`];

  if (profile.dietaryRestrictions.length > 0) {
    lines.push(
      `- Restricciones dietéticas (respetar): ${profile.dietaryRestrictions.join(", ")}`,
    );
  }
  if (profile.goals.length > 0) {
    lines.push(`- Objetivos al cocinar: ${profile.goals.join(", ")}`);
  }
  if (profile.dislikedIngredients.length > 0) {
    lines.push(
      `- Ingredientes que el usuario prefiere evitar (no los uses en la receta salvo que figuren explícitamente en la lista de ingredientes disponibles): ${profile.dislikedIngredients.join(", ")}`,
    );
  }

  return [
    "Perfil del usuario (adapta dificultad de pasos, tiempos y estilo; respeta restricciones y preferencias cuando sean coherentes con los ingredientes disponibles):",
    ...lines,
  ].join("\n");
}
