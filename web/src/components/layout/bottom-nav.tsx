"use client";

import type { Session } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";

import {
  isActiveNavPath,
  isMobileMoreSectionActive,
  mobileBarNavItems,
  mobileMoreNavItems,
} from "@/components/layout/nav-config";
import { getAuthenticatedNavHref } from "@/lib/auth/nav-href";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils/cn";

type BottomNavProps = {
  session: Session | null;
};

const navItemClass = (active: boolean) =>
  cn(
    "flex min-h-12 flex-col items-center justify-center rounded-xl px-2 text-xs font-semibold transition-colors sm:text-[13px]",
    active
      ? "text-primary"
      : "text-muted-foreground hover:text-foreground",
  );

export function BottomNav({ session }: BottomNavProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreDialogTitleId = useId();

  const closeMore = useCallback(() => setMoreOpen(false), []);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMore();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moreOpen, closeMore]);

  useEffect(() => {
    closeMore();
  }, [pathname, closeMore]);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.08)] backdrop-blur-lg dark:shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.45)] sm:hidden"
        aria-label={t("layout.mainNavAria")}
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1 px-2 pt-1.5">
          {mobileBarNavItems.map(({ href, labelKey }) => {
            const active = isActiveNavPath(pathname, href);
            const targetHref = getAuthenticatedNavHref(href, session);

            return (
              <li key={href} className="min-w-0 flex-1">
                <Link
                  href={targetHref}
                  prefetch={false}
                  className={navItemClass(active)}
                >
                  <span className="line-clamp-2 text-center leading-tight">
                    {t(labelKey)}
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="min-w-0 flex-1">
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-controls="mobile-nav-more-panel"
              aria-haspopup="dialog"
              aria-label={t("layout.moreSections")}
              className={cn(
                navItemClass(isMobileMoreSectionActive(pathname) || moreOpen),
                "w-full touch-manipulation",
              )}
              onClick={() => setMoreOpen((o) => !o)}
            >
              <span className="line-clamp-2 text-center leading-tight">
                {t("nav.more")}
              </span>
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-[60] sm:hidden" aria-hidden={false}>
          <button
            type="button"
            aria-label={t("layout.closeMenu")}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={closeMore}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={moreDialogTitleId}
            id="mobile-nav-more-panel"
            className="absolute bottom-0 left-0 right-0 max-h-[min(70vh,28rem)] overflow-y-auto rounded-t-2xl border border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] shadow-lg"
          >
            <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/40" />
            <h2 id={moreDialogTitleId} className="sr-only">
              {t("layout.moreOptions")}
            </h2>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("layout.moreInApp")}
            </p>
            <ul className="grid gap-1">
              {mobileMoreNavItems.map(({ href, labelKey }) => {
                const active = isActiveNavPath(pathname, href);
                const targetHref = getAuthenticatedNavHref(href, session);

                return (
                  <li key={href}>
                    <Link
                      href={targetHref}
                      prefetch={false}
                      className={cn(
                        "block rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-muted text-foreground"
                          : "text-foreground hover:bg-muted/70",
                      )}
                      onClick={closeMore}
                    >
                      {t(labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
