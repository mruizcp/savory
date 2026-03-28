/**
 * Variables de entorno de Auth.js / NextAuth.
 * AUTH_SECRET es obligatorio en producción.
 */
export function getAuthSecret(): string {
  const fromEnv =
    process.env.AUTH_SECRET?.trim() ?? process.env.NEXTAUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "development") {
    return "dev-only-set-AUTH_SECRET-in-env-local";
  }
  throw new Error(
    "AUTH_SECRET es obligatorio en producción. Genere uno con: openssl rand -base64 32",
  );
}

export function getAuthUrl(): string | undefined {
  return (
    process.env.AUTH_URL?.trim() ??
    process.env.NEXTAUTH_URL?.trim() ??
    undefined
  );
}
