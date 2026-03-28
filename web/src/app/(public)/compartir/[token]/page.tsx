import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecipeReadOnlyView } from "@/components/recipes/recipe-read-only-view";
import { Container } from "@/components/ui/container";
import { getRecipeDetailByShareToken } from "@/server/recipes/share-token";

type PageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const recipe = await getRecipeDetailByShareToken(token);
  if (!recipe) {
    return { title: "Receta no disponible" };
  }
  return {
    title: `${recipe.title} (compartida)`,
    description: recipe.description ?? undefined,
    robots: { index: false, follow: false },
  };
}

export default async function SharedRecipePage({ params }: PageProps) {
  const { token } = await params;
  const recipe = await getRecipeDetailByShareToken(token);

  if (!recipe) {
    notFound();
  }

  return (
    <Container className="py-8 sm:py-10">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Receta compartida
      </p>
      <header className="mt-2 space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {recipe.title}
        </h1>
        {recipe.description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {recipe.description}
          </p>
        ) : null}
      </header>

      <div className="mt-8">
        <RecipeReadOnlyView recipe={recipe} />
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        ¿Quieres generar tus propias recetas?{" "}
        <Link href="/login" className="font-medium text-accent underline-offset-4 hover:underline">
          Crea una cuenta o inicia sesión
        </Link>
        .
      </p>
    </Container>
  );
}
