import { NextResponse } from "next/server";
import { z } from "zod";

import { createCookbook, listCookbooks } from "@/server/collections/cookbooks";
import { requireAuth, requireDatabase } from "@/server/http/api-guards";
import { ensureUserForAuth } from "@/server/users/ensure-user";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
});

export async function GET() {
  const authResult = await requireAuth("No autorizado.");
  if (!authResult.ok) return authResult.response;

  const cookbooks = await listCookbooks({ userId: authResult.userId });
  return NextResponse.json({ cookbooks });
}

export async function POST(request: Request) {
  const authResult = await requireAuth("No autorizado.");
  if (!authResult.ok) return authResult.response;
  const { session, userId } = authResult;

  const dbResult = requireDatabase("Base de datos no configurada.");
  if (!dbResult.ok) return dbResult.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  await ensureUserForAuth({
    userId: userId,
    email: session.user?.email,
    displayName: session.user?.name,
  });

  const created = await createCookbook({
    userId,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
  });

  if (!created) {
    return NextResponse.json(
      { error: "No se pudo crear el recetario." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: created.id });
}
