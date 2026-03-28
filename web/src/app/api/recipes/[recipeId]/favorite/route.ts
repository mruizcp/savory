import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getFavoriteStatus,
  toggleRecipeFavorite,
} from "@/server/collections/favorites";
import { ensureUserForAuth } from "@/server/users/ensure-user";

type RouteContext = { params: Promise<{ recipeId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { recipeId } = await context.params;
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json({ favorited: false });
  }

  const favorited = await getFavoriteStatus({ userId, recipeId });
  return NextResponse.json({ favorited });
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      { error: "Base de datos no configurada." },
      { status: 503 },
    );
  }

  await ensureUserForAuth({
    userId: userId,
    email: session.user?.email,
    displayName: session.user?.name,
  });

  const { recipeId } = await context.params;
  const result = await toggleRecipeFavorite({ userId, recipeId });

  if (!result) {
    return NextResponse.json(
      { error: "Receta no encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}
