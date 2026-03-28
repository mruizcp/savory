import "server-only";

import OpenAI from "openai";

import { INGREDIENT_CATALOG } from "@/features/ingredients/constants";
import {
  recommendationsOutputSchema,
  type RecommendationSuggestion,
} from "@/lib/recommendations/recommendation-schema";
import {
  gatherUserSignals,
  type UserSignals,
} from "@/server/recommendations/gather-user-signals";

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function getModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

const HIGHLIGHT_MIN = 2;
const HIGHLIGHT_MAX = 5;

function preferredIngredients(signals: UserSignals): string[] {
  const disliked = new Set(signals.dislikedIngredients.map(normalize));
  const fromRanking = signals.topIngredients.filter(
    (x) => !disliked.has(normalize(x)),
  );
  const catalog = INGREDIENT_CATALOG.filter((x) => !disliked.has(normalize(x)));
  const merged = [...fromRanking, ...catalog];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of merged) {
    const n = normalize(raw);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

function sanitizeHighlights(raw: string[], preferred: string[]): string[] {
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const x of raw) {
    const n = normalize(x);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    cleaned.push(n);
    if (cleaned.length >= HIGHLIGHT_MAX) return cleaned;
  }
  for (const p of preferred) {
    if (seen.has(p)) continue;
    seen.add(p);
    cleaned.push(p);
    if (cleaned.length >= HIGHLIGHT_MAX) break;
  }
  return cleaned;
}

/** Garantiza al menos `HIGHLIGHT_MIN` ítems usando preferidos, catálogo y último recurso genérico. */
function ensureHighlightMinimum(
  highlights: string[],
  disliked: Set<string>,
  preferred: string[],
): string[] {
  const seen = new Set(highlights.map(normalize));
  const out = [...highlights];
  const pushFrom = (candidates: readonly string[]) => {
    for (const c of candidates) {
      if (out.length >= HIGHLIGHT_MIN) return;
      const n = normalize(c);
      if (!n || disliked.has(n) || seen.has(n)) continue;
      seen.add(n);
      out.push(n);
    }
  };
  pushFrom(preferred);
  pushFrom(INGREDIENT_CATALOG);
  pushFrom(["cebolla", "tomate", "huevo", "arroz", "papa", "pollo"]);
  return out.slice(0, HIGHLIGHT_MAX);
}

function sanitizeSuggestions(
  signals: UserSignals,
  list: RecommendationSuggestion[],
): RecommendationSuggestion[] {
  const disliked = new Set(signals.dislikedIngredients.map(normalize));
  const preferred = preferredIngredients(signals);
  return list.map((s) => {
    const safeHighlights = s.highlightIngredients.filter(
      (x) => !disliked.has(normalize(x)),
    );
    const merged = sanitizeHighlights(safeHighlights, preferred);
    const highlightIngredients = ensureHighlightMinimum(
      merged,
      disliked,
      preferred,
    );
    return { ...s, highlightIngredients };
  });
}

function fallbackFromSignals(signals: UserSignals): RecommendationSuggestion[] {
  const disliked = new Set(signals.dislikedIngredients.map(normalize));
  const safeCatalog = INGREDIENT_CATALOG.filter(
    (x) => !disliked.has(normalize(x)),
  );
  const top = signals.topIngredients.filter((x) => !disliked.has(normalize(x)));

  const a = top[0] ?? safeCatalog[0] ?? "cebolla";
  const b = top[1] ?? safeCatalog[1] ?? "tomate";
  const c = top[2] ?? safeCatalog[2] ?? "huevo";
  const d = top[3] ?? safeCatalog[3] ?? "arroz";

  const {
    recipeEventsLast14d,
    correctedEventsLast14d,
    favoritesConsidered,
    correctedRecipesLoaded,
  } = signals.behavior;

  let behaviorNote =
    recipeEventsLast14d > 0
      ? "Has estado generando varias recetas: probemos variaciones cercanas a lo que ya cocinas."
      : "Puedes llevar estos ingredientes a platos sencillos de una sola olla.";
  if (favoritesConsidered > 0) {
    behaviorNote += ` Tus favoritos marcan ingredientes que repetís.`;
  }
  if (correctedRecipesLoaded > 0 || correctedEventsLast14d > 0) {
    behaviorNote += ` Las correcciones indican cómo afinás cada plato.`;
  }

  const rough: RecommendationSuggestion[] = [
    {
      title: `Idea rápida con ${a} y ${b}`,
      rationale: `${behaviorNote} Combina tus ingredientes más presentes en un salteado o guiso.`,
      highlightIngredients: [a, b, c].filter(
        (x, i, arr) => arr.indexOf(x) === i,
      ),
    },
    {
      title: `Desayuno o cena con ${c}`,
      rationale:
        "Encaja con hábitos caseros y suele necesitar pocos extras en la despensa.",
      highlightIngredients: [c, d].filter((x, i, arr) => arr.indexOf(x) === i),
    },
    {
      title: `Arma un bowl con ${d} y lo que tengas fresco`,
      rationale:
        "Los bowls permiten aprovechar restos y alinear con tus listas recientes de ingredientes.",
      highlightIngredients: [d, a].filter((x, i, arr) => arr.indexOf(x) === i),
    },
  ];
  return sanitizeSuggestions(signals, rough);
}

function buildPrompt(signals: UserSignals): string {
  const ing = signals.topIngredients.length
    ? signals.topIngredients.join(", ")
    : "(sin datos aún)";
  const scoreTop = signals.ingredientScores
    .slice(0, 12)
    .map((x) => `${x.name}:${x.score.toFixed(1)}`)
    .join(", ");
  const hints = signals.recentRecipeHints.length
    ? signals.recentRecipeHints.join(" | ")
    : "(ninguna)";
  const avoid = signals.dislikedIngredients.length
    ? signals.dislikedIngredients.join(", ")
    : "(ninguno indicado)";
  const diet =
    signals.dietaryRestrictions.length > 0
      ? signals.dietaryRestrictions.join(", ")
      : "(ninguna indicada)";
  const goals =
    signals.cookingGoals.length > 0
      ? signals.cookingGoals.join(", ")
      : "(ninguno indicado)";
  const level = signals.cookingLevel?.trim() || "(no indicado)";
  const {
    recipeEventsLast14d,
    ingredientSessionEventsLast14d,
    correctedEventsLast14d,
    favoritesConsidered,
    correctedRecipesLoaded,
  } = signals.behavior;

  return `Eres un asistente culinario para la app "Savory".
Responde SOLO con un objeto JSON válido (sin markdown).

Señales del usuario:
- Ingredientes frecuentes (orden por relevancia aprendida): ${ing}
- Scores agregados (nombre:peso, recorte): ${scoreTop || "(sin mezcla aún)"}
- Pistas de recetas o títulos recientes (favoritos, corregidas, historial): ${hints}
- Ingredientes a evitar SIEMPRE en título, rationale e ingredientes destacados: ${avoid}
- Restricciones dietéticas (respetar): ${diet}
- Objetivos de cocina / hábitos deseados: ${goals}
- Nivel de cocina declarado: ${level}
- Comportamiento (últimos ~14 días): ${recipeEventsLast14d} recetas generadas/regeneradas; ${ingredientSessionEventsLast14d} listas de ingredientes guardadas; ${correctedEventsLast14d} correcciones en historial.
- Recetas favoritas consideradas en ranking: ${favoritesConsidered}; recetas corregidas cargadas: ${correctedRecipesLoaded}.

Genera exactamente 3 sugerencias de platos en español (latinoamericano), distintas entre sí.
Cada sugerencia:
- "title": título corto y apetitoso (máx. ~80 caracteres)
- "rationale": 1-2 frases explicando por qué encaja con este usuario (menciona restricciones u objetivos solo si aplican)
- "highlightIngredients": array de 2 a 5 ingredientes concretos (nombres en minúsculas, sin cantidades); NUNCA incluir los de "evitar".

Esquema JSON exacto:
{
  "suggestions": [
    { "title": "...", "rationale": "...", "highlightIngredients": ["...", "..."] }
  ]
}`;
}

async function generateWithAi(
  signals: UserSignals,
): Promise<RecommendationSuggestion[]> {
  const client = getOpenAIClient();
  if (!client) throw new Error("no openai");

  const completion = await client.chat.completions.create({
    model: getModel(),
    response_format: { type: "json_object" },
    temperature: 0.65,
    messages: [
      {
        role: "user",
        content: buildPrompt(signals),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("empty");

  const parsed = JSON.parse(raw) as unknown;
  const out = recommendationsOutputSchema.parse(parsed);
  return sanitizeSuggestions(signals, out.suggestions.slice(0, 3));
}

export type GenerateRecommendationsResult = {
  suggestions: RecommendationSuggestion[];
  source: "ai" | "rules";
};

export async function generateRecommendationsForUser(
  userId: string,
): Promise<GenerateRecommendationsResult> {
  const signals = await gatherUserSignals(userId);

  if (getOpenAIClient()) {
    try {
      const suggestions = await generateWithAi(signals);
      return { suggestions, source: "ai" };
    } catch {
      // reglas
    }
  }

  return {
    suggestions: fallbackFromSignals(signals),
    source: "rules",
  };
}
