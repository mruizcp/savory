"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from "@/lib/i18n/constants";
import { en } from "@/lib/i18n/locales/en";
import { es } from "@/lib/i18n/locales/es";
import { resolveInitialLocale } from "@/lib/i18n/resolve-locale";
import { translate } from "@/lib/i18n/translate";

const CATALOG: Record<Locale, Record<string, unknown>> = {
  es: es as unknown as Record<string, unknown>,
  en: en as unknown as Record<string, unknown>,
};

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
    setLocaleState(resolveInitialLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    document.documentElement.lang = locale === "en" ? "en" : "es";
  }, [locale, hasHydrated]);

  const messages = CATALOG[locale];

  const t = useCallback<TranslateFn>(
    (key, vars) => translate(messages, key, vars),
    [messages],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

/** Para pruebas o lectura opcional sin lanzar si falta el provider. */
export function useOptionalI18n(): I18nContextValue | null {
  return useContext(I18nContext);
}
