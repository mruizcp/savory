"use client";

import Link from "next/link";
import type { Session } from "next-auth";

import { AuthLinks } from "@/components/auth/auth-links";
import { LogoMark } from "@/components/brand/logo-mark";
import { getAuthenticatedNavHref } from "@/lib/auth/nav-href";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";
import { useI18n } from "@/lib/i18n/i18n-context";

type AppHeaderProps = {
  session: Session | null;
};

export function AppHeader({ session }: AppHeaderProps) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] backdrop-blur-2xl dark:border-border/40 dark:bg-background/65 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
      <Container className="flex h-[3.35rem] items-center gap-3 sm:h-16">
        <Link
          href={getAuthenticatedNavHref("/", session)}
          className="group flex min-w-0 shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90 sm:gap-3"
        >
          <LogoMark size={34} />
          <span className="flex min-w-0 flex-col gap-0.5 leading-none">
            <span className="block max-w-[11rem] truncate text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary sm:max-w-[14rem]">
              {t("common.brandKitchen")}
            </span>
            <span className="block text-base font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
              {siteConfig.name}
            </span>
          </span>
        </Link>

        <DesktopNav session={session} />

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <AuthLinks session={session} />
        </div>
      </Container>
    </header>
  );
}
