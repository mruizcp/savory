"use client";

import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils/cn";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className="flex items-center rounded-xl border border-border/60 bg-muted/30 p-0.5 text-xs font-semibold shadow-sm backdrop-blur-sm dark:bg-muted/20"
      role="group"
      aria-label={t("language.switcherAria")}
    >
      <button
        type="button"
        onClick={() => setLocale("es")}
        className={cn(
          "min-h-8 rounded-lg px-2.5 py-1 transition-interactive",
          locale === "es"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={locale === "es"}
      >
        {t("language.es")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "min-h-8 rounded-lg px-2.5 py-1 transition-interactive",
          locale === "en"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={locale === "en"}
      >
        {t("language.en")}
      </button>
    </div>
  );
}
