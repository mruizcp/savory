import type { Session } from "next-auth";

/**
 * Rutas de app que requieren sesión: si no hay usuario, lleva a /login con retorno seguro.
 */
export function getAuthenticatedNavHref(
  href: string,
  session: Session | null,
): string {
  if (session?.user?.id && href === "/") {
    return "/cocinar";
  }
  if (href === "/" || session?.user?.id) {
    return href;
  }
  const callback = encodeURIComponent(href);
  return `/login?callbackUrl=${callback}`;
}
