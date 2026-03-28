/**
 * Evita redirecciones abiertas tras login (solo rutas relativas internas).
 */
export function getSafeCallbackUrl(candidate: string | undefined): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/";
  }
  return candidate;
}
