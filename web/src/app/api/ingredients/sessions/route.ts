import { NextResponse } from "next/server";
import { z } from "zod";

import { persistIngredientSession } from "@/server/ingredients/persist-ingredient-session";
import { requireAuth, requireDatabase } from "@/server/http/api-guards";
import { ensureUserForAuth } from "@/server/users/ensure-user";

const bodySchema = z.object({
  sourceType: z.enum(["MANUAL", "PHOTO"]),
  imageUrl: z.string().max(1024).optional().nullable(),
  storageProvider: z.string().max(80).optional().nullable(),
  detectionProvider: z.string().max(80).optional().nullable(),
  ingredientNames: z.array(z.string()).min(1).max(80),
});

export async function POST(request: Request) {
  const authResult = await requireAuth(
    "Debes iniciar sesión para guardar ingredientes.",
  );
  if (!authResult.ok) return authResult.response;
  const { session, userId } = authResult;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la petición no válido." },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos." },
      { status: 400 },
    );
  }

  const dbResult = requireDatabase(
    "No hay base de datos configurada. Configura DATABASE_URL para guardar historial.",
  );
  if (!dbResult.ok) return dbResult.response;

  await ensureUserForAuth({
    userId: userId,
    email: session.user?.email,
    displayName: session.user?.name,
  });

  const result = await persistIngredientSession({
    userId,
    sourceType: parsed.data.sourceType,
    imageUrl: parsed.data.imageUrl ?? null,
    storageProvider: parsed.data.storageProvider ?? null,
    detectionProvider: parsed.data.detectionProvider ?? null,
    ingredientNames: parsed.data.ingredientNames,
  });

  if (!result) {
    return NextResponse.json(
      { error: "Indica al menos un ingrediente." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    sessionId: result.sessionId,
    persisted: true,
  });
}
