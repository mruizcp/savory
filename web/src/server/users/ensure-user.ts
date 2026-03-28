import "server-only";

import { normalizeEmail } from "@/lib/auth/normalize-email";
import { prisma } from "@/server/db/prisma";

/**
 * Actualiza correo o nombre mostrado si vienen del proveedor de sesión (sin crear usuario nuevo).
 */
export async function ensureUserForAuth(params: {
  userId: string;
  email?: string | null;
  displayName?: string | null;
}): Promise<void> {
  const normalized =
    params.email != null && params.email.trim()
      ? normalizeEmail(params.email)
      : null;

  if (normalized) {
    const conflict = await prisma.user.findFirst({
      where: {
        email: normalized,
        NOT: { id: params.userId },
      },
      select: { id: true },
    });
    if (conflict) {
      throw new Error("EMAIL_ALREADY_REGISTERED");
    }
  }

  await prisma.user.updateMany({
    where: { id: params.userId },
    data: {
      ...(normalized ? { email: normalized } : {}),
      ...(params.displayName != null
        ? { displayName: params.displayName }
        : {}),
    },
  });
}
