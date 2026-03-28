"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils/cn";

const ghostLinkBase =
  "inline-flex min-h-9 items-center justify-center rounded-xl px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const primaryCtaBase =
  "inline-flex min-h-9 items-center justify-center rounded-xl px-4 text-sm font-semibold shadow-sm transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type AuthLinksProps = {
  session: Session | null;
};

export function AuthLinks({ session }: AuthLinksProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const onLogin =
    pathname === "/login" || pathname.startsWith("/login?");
  const onRegistro =
    pathname === "/registro" || pathname.startsWith("/registro?");

  if (session?.user?.id) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/perfil"
          className={cn(
            primaryCtaBase,
            "bg-primary text-primary-foreground hover:brightness-105 dark:hover:brightness-110",
          )}
        >
          {t("auth.profile")}
        </Link>
        <SignOutButton
          variant="ghost"
          className="hidden min-h-9 px-2 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground sm:inline-flex"
        />
      </div>
    );
  }

  return (
    <div className="relative z-[1] flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
      <Link
        href="/registro"
        className={cn(
          ghostLinkBase,
          onRegistro
            ? "bg-primary/15 font-semibold text-primary ring-1 ring-primary/25 dark:bg-primary/20"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        )}
        aria-current={onRegistro ? "page" : undefined}
      >
        {t("auth.register")}
      </Link>
      <Link
        href="/login"
        className={cn(
          primaryCtaBase,
          onLogin
            ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background hover:brightness-105 dark:hover:brightness-110"
            : onRegistro
              ? "border border-border bg-background font-medium text-foreground hover:bg-muted/80 dark:border-border/80"
              : "bg-primary text-primary-foreground hover:brightness-105 dark:hover:brightness-110",
        )}
        aria-current={onLogin ? "page" : undefined}
      >
        {t("auth.signIn")}
      </Link>
    </div>
  );
}
