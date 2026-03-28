import type { ReactNode } from "react";

import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";

/** Evita caché rígida del shell que puede dejar la navegación “atascada” en una ruta. */
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const signedIn = Boolean(session?.user?.id);
  const showPersistenceWarning = signedIn && !isDatabaseConfigured();

  return (
    <AppShell session={session} showPersistenceWarning={showPersistenceWarning}>
      {children}
    </AppShell>
  );
}
