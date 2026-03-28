import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  absoluteShareUrl,
  generateOrRotateShareToken,
  getShareStatusForOwner,
  revokeShareToken,
} from "@/server/recipes/share-token";
import { ensureUserForAuth } from "@/server/users/ensure-user";

type RouteContext = { params: Promise<{ recipeId: string }> };

function getRequestOrigin(request: Request): string | null {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return null;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto =
    forwardedProto ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  return `${proto}://${host}`;
}

export async function GET(request: Request, context: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { recipeId } = await context.params;

  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json({
      active: false,
      token: null,
      shareUrl: null,
    });
  }

  const status = await getShareStatusForOwner({ userId, recipeId });
  if (!status) {
    return NextResponse.json({ error: "Receta no encontrada." }, { status: 404 });
  }

  const origin = getRequestOrigin(request);
  const shareUrl = status.token
    ? absoluteShareUrl(status.token, origin)
    : null;

  return NextResponse.json({
    active: status.active,
    token: status.token,
    shareUrl,
  });
}

export async function POST(request: Request, context: RouteContext) {
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
  const origin = getRequestOrigin(request);

  const result = await generateOrRotateShareToken({
    userId,
    recipeId,
    requestOrigin: origin,
  });

  if (!result) {
    return NextResponse.json({ error: "Receta no encontrada." }, { status: 404 });
  }

  return NextResponse.json({
    token: result.token,
    shareUrl: result.shareUrl,
    active: true,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
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
  const ok = await revokeShareToken({ userId, recipeId });

  if (!ok) {
    return NextResponse.json(
      { error: "No hay enlace activo o la receta no existe." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
