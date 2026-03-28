import type { Session } from "next-auth";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppMain } from "@/components/layout/app-main";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PersistenceWarningBanner } from "@/components/layout/persistence-warning-banner";

type AppShellProps = {
  children: ReactNode;
  session: Session | null;
  /** Usuario autenticado pero sin DATABASE_URL: mostrar aviso de no persistencia */
  showPersistenceWarning?: boolean;
};

export function AppShell({
  children,
  session,
  showPersistenceWarning = false,
}: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader session={session} />
      {showPersistenceWarning ? <PersistenceWarningBanner /> : null}
      <AppMain>{children}</AppMain>
      <BottomNav session={session} />
    </div>
  );
}
