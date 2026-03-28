import Link from "next/link";

import { auth } from "@/auth";
import { HistoryPageClient } from "@/components/history/history-page-client";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";

export default async function HistorialPage() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);
  const persistenceAvailable = isDatabaseConfigured();

  return (
    <Container className="py-6 sm:py-10">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Historial
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {!isSignedIn ? (
          <>
            Ingredientes guardados, fotos analizadas, recetas generadas y
            cambios de perfil, en orden cronológico.
          </>
        ) : persistenceAvailable ? (
          <>
            Ingredientes guardados, fotos analizadas, recetas generadas y
            cambios de perfil, en orden cronológico.
          </>
        ) : (
          <>
            El historial solo se registra cuando el servidor tiene base de datos
            configurada (<code className="text-foreground">DATABASE_URL</code>
            ).
          </>
        )}
      </p>

      {!isSignedIn ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <p>Inicia sesión para ver y registrar tu historial.</p>
          <Link
            href="/login?callbackUrl=%2Fhistorial"
            className={cn(
              "mt-4 inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors",
              "bg-primary text-primary-foreground shadow-sm hover:brightness-105 dark:hover:brightness-110",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            Iniciar sesión
          </Link>
        </div>
      ) : (
        <HistoryPageClient persistenceAvailable={persistenceAvailable} />
      )}
    </Container>
  );
}
