import { NextResponse } from "next/server";
import { z } from "zod";

import { isDatabaseConfigured } from "@/server/env/is-database-configured";
import { requireAuth } from "@/server/http/api-guards";
import { persistRecipeCorrection } from "@/server/recipes/persist-recipe-correction";

const ingredientSchema = z.object({
  name: z.string().min(1).max(120),
  quantityText: z.string().max(64).nullable().optional(),
  isMissing: z.boolean(),
});

const stepSchema = z.object({
  stepNumber: z.number().int().min(1).max(50),
  instruction: z.string().min(1).max(2000),
});

const bodySchema = z.object({
  title: z.string().min(1).max(180),
  description: z.string().max(2000).nullable().optional(),
  servings: z.number().int().min(1).max(50),
  totalMinutes: z.number().int().min(1).max(24 * 60).nullable().optional(),
  calories: z.number().int().min(0).max(20000).nullable().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  utensils: z.array(z.string().max(80)).max(20),
  ingredients: z.array(ingredientSchema).min(1).max(40),
  steps: z.array(stepSchema).min(1).max(40),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  const authResult = await requireAuth("Debes iniciar sesión para guardar cambios.");
  if (!authResult.ok) return authResult.response;

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Base de datos no configurada." },
      { status: 503 },
    );
  }

  const { recipeId } = await params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos. Revisa título, ingredientes y pasos." },
      { status: 400 },
    );
  }

  const draft = {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    servings: parsed.data.servings,
    totalMinutes: parsed.data.totalMinutes ?? null,
    calories: parsed.data.calories ?? null,
    difficulty: parsed.data.difficulty ?? null,
    notes: parsed.data.notes ?? null,
    utensils: parsed.data.utensils,
    ingredients: parsed.data.ingredients.map((i) => ({
      name: i.name,
      quantityText: i.quantityText ?? null,
      isMissing: i.isMissing,
    })),
    steps: parsed.data.steps,
  };

  const result = await persistRecipeCorrection({
    userId: authResult.userId,
    sourceRecipeId: recipeId,
    draft,
  });

  if (!result) {
    return NextResponse.json(
      { error: "No se encontró la receta o no tienes permiso." },
      { status: 404 },
    );
  }

  return NextResponse.json({ recipeId: result.recipeId });
}
