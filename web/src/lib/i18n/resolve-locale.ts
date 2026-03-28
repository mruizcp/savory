import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
  isLocale,
} from "@/lib/i18n/constants";

function localeFromNavigator(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const lang =
    navigator.language ||
    (navigator as Navigator & { userLanguage?: string }).userLanguage ||
    "";
  return lang.toLowerCase().startsWith("en") ? "en" : "es";
}

/** Lee localStorage (solo en cliente). */
export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Preferencia guardada, o idioma del navegador, o español por defecto.
 * Usar tras montar el cliente (p. ej. en useEffect).
 */
export function resolveInitialLocale(): Locale {
  return readStoredLocale() ?? localeFromNavigator();
}
