import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { normalizeEmail } from "@/lib/auth/normalize-email";
import { registerBodySchema } from "@/lib/auth/register-schema";
import { prisma } from "@/server/db/prisma";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";

const GENERIC_REGISTER_ERROR =
  "No se pudo completar el registro. Revisa los datos e inténtalo de nuevo.";

export async function POST(req: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "El servicio no está disponible en este momento." },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud." },
      { status: 400 },
    );
  }

  const parsed = registerBodySchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? GENERIC_REGISTER_ERROR },
      { status: 400 },
    );
  }

  const { email, password, displayName } = parsed.data;
  const normalized = normalizeEmail(email);

  const existing = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: GENERIC_REGISTER_ERROR }, { status: 409 });
  }

  try {
    const passwordHash = await hash(password, 12);
    await prisma.user.create({
      data: {
        email: normalized,
        passwordHash,
        displayName: displayName?.trim() || null,
      },
    });
  } catch {
    return NextResponse.json({ error: GENERIC_REGISTER_ERROR }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
