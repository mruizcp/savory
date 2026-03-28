/** Rutas principales del app shell (escritorio: lista completa). */
export const primaryNavItems = [
  { href: "/", labelKey: "nav.home" },
  { href: "/cocinar", labelKey: "nav.cook" },
  { href: "/recetas/explorar", labelKey: "nav.exploreRecipes" },
  { href: "/favoritos", labelKey: "nav.favorites" },
  { href: "/recetarios", labelKey: "nav.cookbooks" },
  { href: "/historial", labelKey: "nav.history" },
  { href: "/perfil", labelKey: "nav.profile" },
] as const;

/** Header compacto (escritorio): enlaces principales visibles sin depender solo de «Más». */
export const headerPrimaryNavItems = [
  { href: "/cocinar", labelKey: "nav.cook" },
  { href: "/recetas/explorar", labelKey: "nav.exploreRecipes" },
  { href: "/favoritos", labelKey: "nav.favorites" },
  { href: "/historial", labelKey: "nav.history" },
] as const;

/** Agrupados bajo «Más» en el header. */
export const headerOverflowNavItems = [
  { href: "/", labelKey: "nav.home" },
  { href: "/recetarios", labelKey: "nav.cookbooks" },
  { href: "/perfil", labelKey: "nav.profile" },
] as const;

/**
 * Barra inferior móvil: menos ítems visibles + “Más”.
 * Historial en barra (canvas: historial siempre; prioridad sobre favoritos en descubrimiento).
 */
export const mobileBarNavItems = [
  { href: "/cocinar", labelKey: "nav.cook" },
  { href: "/recetas/explorar", labelKey: "nav.exploreRecipes" },
  { href: "/favoritos", labelKey: "nav.favorites" },
  { href: "/historial", labelKey: "nav.history" },
] as const;

/** Enlaces agrupados bajo “Más” en móvil (mismas rutas que en escritorio). */
export const mobileMoreNavItems = [
  { href: "/", labelKey: "nav.home" },
  { href: "/recetarios", labelKey: "nav.cookbooks" },
  { href: "/perfil", labelKey: "nav.profile" },
] as const;

/**
 * Activo si la ruta coincide exactamente o es un subsegmento (`/recetarios/id`), sin falsos positivos por prefijo (`/co` ≠ `/cocinar`).
 */
export function isActiveNavPath(pathname: string, href: string): boolean {
  const p =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const h =
    href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;

  if (h === "/") {
    return p === "/";
  }
  return p === h || p.startsWith(`${h}/`);
}

export function isMobileMoreSectionActive(pathname: string): boolean {
  return mobileMoreNavItems.some(({ href }) => isActiveNavPath(pathname, href));
}

export function isHeaderOverflowActive(pathname: string): boolean {
  return headerOverflowNavItems.some(({ href }) =>
    isActiveNavPath(pathname, href),
  );
}
