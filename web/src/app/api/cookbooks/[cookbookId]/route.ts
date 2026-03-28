import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import {
  deleteCookbook,
  getCookbookDetail,
  updateCookbook,
} from "@/server/collections/cookbooks";
import { ensureUserForAuth } from "@/server/users/ensure-user";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional().nullable(),
});

type RouteContext = { params: Promise<{ cookbookId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { cookbookId } = await context.params;
  const detail = await getCookbookDetail({ userId, cookbookId });

  if (!detail) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }

  return NextResponse.json({ cookbook: detail });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { cookbookId } = await context.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  if (
    parsed.data.name === undefined &&
    parsed.data.description === undefined
  ) {
    return NextResponse.json(
      { error: "Envía al menos nombre o descripción." },
      { status: 400 },
    );
  }

  await ensureUserForAuth({
    userId: userId,
    email: session.user?.email,
    displayName: session.user?.name,
  });

  const ok = await updateCookbook({
    userId,
    cookbookId,
    name: parsed.data.name,
    description: parsed.data.description,
  });

  if (!ok) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { cookbookId } = await context.params;

  await ensureUserForAuth({
    userId: userId,
    email: session.user?.email,
    displayName: session.user?.name,
  });

  const ok = await deleteCookbook({ userId, cookbookId });

  if (!ok) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
