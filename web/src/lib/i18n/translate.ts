import { es } from "@/lib/i18n/locales/es";

type Vars = Record<string, string | number>;

/** Catálogo español como respaldo si falta una clave en el idioma activo. */
const FALLBACK_MESSAGES = es as unknown as Record<string, unknown>;

function getNested(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const segment of path) {
    if (cur === null || cur === undefined) return undefined;
    if (typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[segment];
  }
  return cur;
}

/**
 * Resuelve claves con puntos (`home.hero.title`) y reemplaza `{{var}}`.
 * Si no existe en el idioma actual, intenta español (evita mostrar la clave cruda).
 */
export function translate(
  messages: Record<string, unknown>,
  key: string,
  vars?: Vars,
): string {
  const path = key.split(".");
  let value = getNested(messages, path);
  if (typeof value !== "string" && messages !== FALLBACK_MESSAGES) {
    value = getNested(FALLBACK_MESSAGES, path);
  }
  if (typeof value !== "string") {
    return key;
  }
  if (!vars) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{{${name}}}`,
  );
}
