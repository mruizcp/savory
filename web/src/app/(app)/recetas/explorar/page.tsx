import Link from "next/link";

import { auth } from "@/auth";
import { RecipesSearchPageClient } from "@/components/recipes/recipes-search-page-client";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";

export default async function RecetasExplorarPage() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user?.id);
  const persistenceAvailable = isDatabaseConfigured();

  return (
    <Container className="py-6 sm:py-10">
      <nav aria-label="Migas" className="mb-4">
        <Link
          href="/cocinar"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Volver a generar recetas
        </Link>
      </nav>

      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Mis recetas guardadas
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Busca entre tus recetas guardadas por texto y filtra por tipo de comida,
        tiempo máximo, dificultad o una etiqueta de dieta (las recetas nuevas
        guardan clasificación desde la IA; las antiguas pueden quedar sin
        etiquetas).
      </p>

      {!isSignedIn ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <p>Inicia sesión para buscar y abrir tus recetas.</p>
          <Link
            href="/login?callbackUrl=%2Frecetas%2Fexplorar"
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
        <RecipesSearchPageClient persistenceAvailable={persistenceAvailable} />
      )}
    </Container>
  );
}
