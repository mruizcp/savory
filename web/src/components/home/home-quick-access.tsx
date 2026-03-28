"use client";

import Link from "next/link";
import type { Session } from "next-auth";

import { getAuthenticatedNavHref } from "@/lib/auth/nav-href";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils/cn";

const items = [
  {
    href: "/cocinar",
    titleKey: "home.quickCook",
    descKey: "home.quickCookDesc",
  },
  {
    href: "/favoritos",
    titleKey: "home.quickFavorites",
    descKey: "home.quickFavoritesDesc",
  },
  {
    href: "/historial",
    titleKey: "home.quickHistory",
    descKey: "home.quickHistoryDesc",
  },
] as const;

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type HomeQuickAccessProps = {
  session: Session | null;
};

export function HomeQuickAccess({ session }: HomeQuickAccessProps) {
  const { t } = useI18n();

  return (
    <section className="border-b border-border/60 pb-10 pt-2 dark:border-border/40">
      <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {t("home.quickAccessTitle")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("home.quickAccessSubtitle")}
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {items.map(({ href, titleKey, descKey }) => {
          const target = getAuthenticatedNavHref(href, session);
          return (
            <li key={href}>
              <Link
                href={target}
                className={cn(
                  "group flex h-full min-h-[7.25rem] flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-soft transition",
                  "hover:border-primary/35 hover:shadow-card dark:hover:shadow-card-dark",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold leading-snug text-foreground">
                    {t(titleKey)}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary/18 dark:bg-primary/20">
                    <ArrowIcon />
                  </span>
                </div>
                <span className="mt-auto pt-3 text-xs leading-relaxed text-muted-foreground">
                  {t(descKey)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
