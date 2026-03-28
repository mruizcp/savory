import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import {
  addRecipeToCookbook,
  removeRecipeFromCookbook,
} from "@/server/collections/cookbooks";
import { ensureUserForAuth } from "@/server/users/ensure-user";

const postSchema = z.object({
  recipeId: z.string().min(1).max(128),
});

type RouteContext = { params: Promise<{ cookbookId: string }> };

export async function POST(request: Request, context: RouteContext) {
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

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  await ensureUserForAuth({
    userId: userId,
    email: session.user?.email,
    displayName: session.user?.name,
  });

  const result = await addRecipeToCookbook({
    userId,
    cookbookId,
    recipeId: parsed.data.recipeId,
  });

  if (!result.ok) {
    if (result.reason === "duplicate") {
      return NextResponse.json(
        { error: "La receta ya está en este recetario." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { cookbookId } = await context.params;
  const { searchParams } = new URL(request.url);
  const recipeId = searchParams.get("recipeId");

  if (!recipeId?.trim()) {
    return NextResponse.json(
      { error: "Falta recipeId en la query." },
      { status: 400 },
    );
  }

  await ensureUserForAuth({
    userId: userId,
    email: session.user?.email,
    displayName: session.user?.name,
  });

  const ok = await removeRecipeFromCookbook({
    userId,
    cookbookId,
    recipeId: recipeId.trim(),
  });

  if (!ok) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
