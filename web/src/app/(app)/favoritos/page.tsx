import Link from "next/link";

import { auth } from "@/auth";
import { FavoritesPageClient } from "@/components/collections/favorites-page-client";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";

export default async function FavoritosPage() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);

  return (
    <Container className="py-6 sm:py-10">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Favoritos
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Recetas que marcaste para volver a ellas rápido.
      </p>

      {!isSignedIn ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <p>Inicia sesión para ver tus favoritos.</p>
          <Link
            href="/login?callbackUrl=%2Ffavoritos"
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
        <div className="mt-8">
          <FavoritesPageClient />
        </div>
      )}
    </Container>
  );
}
