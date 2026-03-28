import "server-only";

import OpenAI from "openai";
import { z } from "zod";

import { INGREDIENT_CATALOG } from "@/features/ingredients/constants";

export type VisionDetectionProvider = "openai-vision" | "mock-vision-fallback";

export type DetectFromImageInput = {
  /** Imagen en base64 (sin prefijo data:…) */
  imageBase64: string;
  mimeType: string;
  fileName: string;
};

export type DetectFromImageResult = {
  ingredients: string[];
  provider: VisionDetectionProvider;
  /** Texto opcional para UI cuando se usó respaldo. */
  fallbackNote?: string;
};

const visionOutputSchema = z.object({
  ingredients: z.array(z.string().min(1).max(80)).min(1).max(35),
});

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9áéíóúñü]+/gi)
    .filter(Boolean);
}

function uniqueNormalized(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of names) {
    const t = raw.trim().replace(/\s+/g, " ");
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

/**
 * Respaldo local (antes mock): heurística por nombre de archivo + catálogo.
 */
function detectIngredientsFallback(fileName: string): string[] {
  const candidateTokens = tokenize(fileName);
  const fromName = INGREDIENT_CATALOG.filter((ingredient) => {
    const tokens = tokenize(ingredient);
    return tokens.some((token) => candidateTokens.includes(token));
  });
  const fallback = ["tomate", "cebolla", "ajo"];
  return uniqueNormalized(fromName.length > 0 ? fromName : fallback);
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function visionModel(): string {
  return (
    process.env.OPENAI_VISION_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    "gpt-4o-mini"
  );
}

const VISION_SYSTEM = `Eres un asistente culinario. Miras fotos de comida o ingredientes.
Tu salida debe ser SIEMPRE un solo JSON válido (sin markdown): {"ingredients": string[]}
Reglas:
- Idioma de los nombres: español (latinoamericano), nombres comunes de alimentos.
- Lista ingredientes alimentarios claramente visibles o muy probables (1–30 ítems).
- Sin cantidades ni números en el nombre salvo que sean parte del nombre usual.
- Ignora marcas, envases, utensilios, manos, mesa.
- Si la imagen no muestra comida reconocible, devuelve {"ingredients": []}.`;

/**
 * Detección por imagen: OpenAI Vision si hay API key; si falla o no hay clave, respaldo seguro (heurística + catálogo).
 */
export async function detectIngredientsFromImage(
  input: DetectFromImageInput,
): Promise<DetectFromImageResult> {
  const mime =
    input.mimeType?.trim() && input.mimeType.startsWith("image/")
      ? input.mimeType
      : "image/jpeg";

  const client = getOpenAIClient();
  if (!client) {
    const ingredients = detectIngredientsFallback(input.fileName);
    return {
      ingredients,
      provider: "mock-vision-fallback",
      fallbackNote:
        "OPENAI_API_KEY no está configurada. Se aplicó detección de respaldo por nombre de archivo.",
    };
  }

  try {
    const completion = await client.chat.completions.create({
      model: visionModel(),
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        { role: "system", content: VISION_SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Enumera los ingredientes alimentarios reconocibles en la imagen.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mime};base64,${input.imageBase64}`,
                detail: "low",
              },
            },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("Respuesta vacía del modelo de visión");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      throw new Error("JSON inválido en respuesta de visión");
    }

    const validated = visionOutputSchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error("Esquema de ingredientes inválido");
    }

    let ingredients = uniqueNormalized(validated.data.ingredients);

    if (ingredients.length === 0) {
      const fb = detectIngredientsFallback(input.fileName);
      return {
        ingredients: fb,
        provider: "mock-vision-fallback",
        fallbackNote:
          "La IA no identificó ingredientes con seguridad. Se muestran sugerencias de respaldo; revísalas y edita la lista.",
      };
    }

    if (ingredients.length > 30) {
      ingredients = ingredients.slice(0, 30);
    }

    return { ingredients, provider: "openai-vision" };
  } catch {
    const ingredients = detectIngredientsFallback(input.fileName);
    return {
      ingredients,
      provider: "mock-vision-fallback",
      fallbackNote:
        "No se pudo usar la visión por IA. Se aplicó detección de respaldo; edita la lista antes de cocinar.",
    };
  }
}
