import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { RecipeDetailView } from "@/components/recipes/recipe-detail-view";
import { Container } from "@/components/ui/container";
import { getRecipeDetailForUser } from "@/server/recipes/get-recipe-for-user";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return { title: "Receta" };
  }
  const recipe = await getRecipeDetailForUser({
    recipeId: id,
    userId: session.user.id,
  });
  if (!recipe) {
    return { title: "Receta no encontrada" };
  }
  return {
    title: `${recipe.title} · Recetas`,
    description: recipe.description ?? undefined,
  };
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    const callback = encodeURIComponent(`/recetas/${id}`);
    redirect(`/login?callbackUrl=${callback}`);
  }

  const recipe = await getRecipeDetailForUser({
    recipeId: id,
    userId: session.user.id,
  });

  if (!recipe) {
    notFound();
  }

  return (
    <Container className="py-6 sm:py-10">
      <RecipeDetailView recipe={recipe} />
    </Container>
  );
}
