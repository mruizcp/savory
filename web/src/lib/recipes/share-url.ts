/**
 * URLs públicas de compartir (sin acceso a BD).
 */

export function buildSharePath(token: string): string {
  return `/compartir/${token}`;
}

export function absoluteShareUrl(
  token: string,
  requestOrigin: string | null,
): string {
  const path = buildSharePath(token);
  if (requestOrigin) {
    return `${requestOrigin.replace(/\/$/, "")}${path}`;
  }
  const base =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "";
  if (base) {
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return path;
}
