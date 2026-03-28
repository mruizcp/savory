import "server-only";

import OpenAI from "openai";

import {
  RECIPE_PROMPT_VERSION,
  RECIPE_SYSTEM_PROMPT,
  buildUserRecipePrompt,
  type GenerationMode,
} from "@/lib/ai/recipe-prompt";
import {
  recipeGenerationOutputSchema,
  type RecipeGenerationOutput,
} from "@/lib/ai/recipe-schema";
import type { UserProfileInput } from "@/features/profile";

/** Estructura de respuesta estable tras validar con Zod. */
export type GenerateRecipeResult = {
  recipe: RecipeGenerationOutput;
  model: string;
  promptVersion: string;
};

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY no configurada");
  }
  return new OpenAI({ apiKey });
}

function getModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export async function generateRecipeStructured(params: {
  ingredients: string[];
  generationType: GenerationMode;
  parentRecipe?: RecipeGenerationOutput | null;
  regenerateHint?: string | null;
  profile?: UserProfileInput | null;
}): Promise<GenerateRecipeResult> {
  const client = getOpenAIClient();
  const model = getModel();

  const userContent = buildUserRecipePrompt({
    ingredients: params.ingredients,
    generationType: params.generationType,
    parentRecipe: params.parentRecipe ?? null,
    regenerateHint: params.regenerateHint ?? null,
    profile: params.profile ?? null,
  });

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: RECIPE_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Respuesta vacía del modelo");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("La respuesta no es JSON válido");
  }

  const recipe = recipeGenerationOutputSchema.parse(parsed);

  return {
    recipe,
    model,
    promptVersion: RECIPE_PROMPT_VERSION,
  };
}
