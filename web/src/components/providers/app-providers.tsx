"use client";

import type { Session } from "next-auth";
import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { I18nProvider } from "@/lib/i18n/i18n-context";
import { ThemeProvider } from "@/components/providers/theme-provider";

type AppProvidersProps = {
  children: ReactNode;
  /** Sesión del servidor para alinear cliente y middleware (navegación y enlaces). */
  session: Session | null;
};

export function AppProviders({ children, session }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <SessionProvider session={session}>{children}</SessionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
