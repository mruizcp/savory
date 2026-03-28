"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { usePathname } from "next/navigation";

import { LogoMark } from "@/components/brand/logo-mark";
import {
  isActiveNavPath,
  primaryNavItems,
} from "@/components/layout/nav-config";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Container } from "@/components/ui/container";
import { getAuthenticatedNavHref } from "@/lib/auth/nav-href";
import { siteConfig } from "@/lib/config/site";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils/cn";

type LandingShellProps = {
  children: React.ReactNode;
  session: Session | null;
};

/**
 * Cabecera y pie para la landing pública, con acceso a las mismas rutas que la app.
 */
export function LandingShell({ children, session }: LandingShellProps) {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl dark:bg-background/80">
        <Container className="flex h-14 items-center gap-3 sm:h-16">
          <Link
            href="/"
            className="group flex min-w-0 shrink-0 items-center gap-2.5"
          >
            <LogoMark size={34} />
            <span className="truncate text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
              {siteConfig.name}
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground sm:inline-flex"
            >
              {t("landingPage.navLogin")}
            </Link>
            <Link
              href="/registro?trial=7"
              className={cn(
                "inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors",
                "bg-primary text-primary-foreground shadow-sm hover:brightness-105 dark:hover:brightness-110",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              {t("landingPage.navCta")}
            </Link>
          </div>
        </Container>

        <Container className="border-t border-border/40 pb-2 pt-1.5 dark:border-border/30">
          <nav
            className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label={t("layout.mainNavAria")}
          >
            {primaryNavItems.map(({ href, labelKey }) => {
              const resolved = getAuthenticatedNavHref(href, session);
              const active = isActiveNavPath(pathname, href);
              return (
                <Link
                  key={href}
                  href={resolved}
                  prefetch={false}
                  scroll
                  className={cn(
                    "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                    active
                      ? "bg-primary/10 text-primary dark:bg-primary/15"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                  )}
                >
                  {t(labelKey)}
                </Link>
              );
            })}
          </nav>
        </Container>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 bg-muted/20 py-10 dark:bg-muted/10">
        <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-semibold text-foreground">{siteConfig.name}</span>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("landingPage.footerTagline")}
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/login" className="text-primary hover:underline">
              {t("landingPage.navLogin")}
            </Link>
            <Link href="/registro?trial=7" className="text-primary hover:underline">
              {t("landingPage.navCta")}
            </Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}
