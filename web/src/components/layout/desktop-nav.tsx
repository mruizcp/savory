"use client";

import type { Session } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  headerOverflowNavItems,
  headerPrimaryNavItems,
  isActiveNavPath,
  isHeaderOverflowActive,
} from "@/components/layout/nav-config";
import { getAuthenticatedNavHref } from "@/lib/auth/nav-href";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils/cn";

type DesktopNavProps = {
  session: Session | null;
};

const navLinkClass = (active: boolean) =>
  cn(
    "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-primary/10 text-primary dark:bg-primary/15"
      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
  );

export function DesktopNav({ session }: DesktopNavProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

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
    if (!moreOpen) return;
    const onPointer = (e: MouseEvent | PointerEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current?.contains(t) ||
        buttonRef.current?.contains(t)
      ) {
        return;
      }
      closeMore();
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [moreOpen, closeMore]);

  useEffect(() => {
    closeMore();
  }, [pathname, closeMore]);

  const overflowActive = isHeaderOverflowActive(pathname);

  return (
    <nav
      className="hidden max-w-xl flex-1 flex-wrap items-center justify-center gap-0.5 sm:flex lg:max-w-none lg:flex-nowrap lg:justify-end lg:gap-1"
      aria-label={t("layout.mainNavAria")}
    >
      {headerPrimaryNavItems.map(({ href, labelKey }) => {
        const active = isActiveNavPath(pathname, href);
        const resolvedHref = getAuthenticatedNavHref(href, session);
        return (
          <Link
            key={href}
            href={resolvedHref}
            prefetch={false}
            className={navLinkClass(active)}
          >
            {t(labelKey)}
          </Link>
        );
      })}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={moreOpen}
          aria-controls={listId}
          aria-haspopup="menu"
          id={`${listId}-trigger`}
          onClick={() => setMoreOpen((o) => !o)}
          className={cn(
            "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            overflowActive || moreOpen
              ? "bg-primary/10 text-primary dark:bg-primary/15"
              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
          )}
        >
          {t("nav.more")}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn("h-4 w-4 transition-transform", moreOpen && "rotate-180")}
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {moreOpen ? (
          <div
            ref={panelRef}
            id={listId}
            role="menu"
            aria-labelledby={`${listId}-trigger`}
            className="absolute right-0 top-[calc(100%+0.35rem)] z-50 min-w-[13.5rem] rounded-2xl border border-border/80 bg-card/95 p-2 shadow-card backdrop-blur-xl dark:border-border/60 dark:bg-card/95 dark:shadow-card-dark"
          >
            <ul className="flex flex-col gap-0.5">
              {headerOverflowNavItems.map(({ href, labelKey }) => {
                const active = isActiveNavPath(pathname, href);
                const resolvedHref = getAuthenticatedNavHref(href, session);
                return (
                  <li key={href} role="none">
                    <Link
                      role="menuitem"
                      href={resolvedHref}
                      prefetch={false}
                      className={cn(
                        "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary dark:bg-primary/15"
                          : "text-foreground hover:bg-muted/80",
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
        ) : null}
      </div>
    </nav>
  );
}
