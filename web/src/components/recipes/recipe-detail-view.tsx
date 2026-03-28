"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { RecipeCollectionActions } from "@/components/recipes/recipe-collection-actions";
import { RecipeCorrectionForm } from "@/components/recipes/recipe-correction-form";
import { RecipeReadOnlyView } from "@/components/recipes/recipe-read-only-view";
import { RecipeSharePanel } from "@/components/recipes/recipe-share-panel";
import { Button } from "@/components/ui/button";
import type { RecipeDetailPayload } from "@/lib/recipes/recipe-detail-payload";
import { cn } from "@/lib/utils/cn";

type RecipeDetailViewProps = {
  recipe: RecipeDetailPayload;
};

export function RecipeDetailView({ recipe }: RecipeDetailViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  function handleSaved(newId: string) {
    setEditing(false);
    router.push(`/recetas/${newId}`);
    router.refresh();
  }

  return (
    <div className="space-y-8 pb-24 sm:pb-10">
      <nav aria-label="Migas" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Link
          href="/recetas/explorar"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Mis recetas guardadas
        </Link>
        <Link
          href="/cocinar"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Generar o regenerar ideas
        </Link>
      </nav>

      {recipe.basedOnRecipeId ? (
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Esta receta es una{" "}
          <strong className="text-foreground">versión corregida</strong>.{" "}
          <Link
            href={`/recetas/${recipe.basedOnRecipeId}`}
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Ver versión anterior
          </Link>
          .
        </p>
      ) : null}

      {!editing ? (
        <>
          <header className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {recipe.description}
              </p>
            )}
          </header>

          <RecipeCollectionActions
            recipeId={recipe.id}
            initialFavorited={recipe.isFavorite ?? false}
          />

          <RecipeSharePanel recipeId={recipe.id} />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="min-h-11"
              onClick={() => setEditing(true)}
            >
              Corregir receta
            </Button>
          </div>

          <RecipeReadOnlyView recipe={recipe} />
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Editar receta
            </h1>
            <Button
              type="button"
              variant="ghost"
              className={cn("min-h-11")}
              onClick={() => setEditing(false)}
            >
              Cerrar edición
            </Button>
          </div>
          <RecipeCorrectionForm
            recipe={recipe}
            onCancel={() => setEditing(false)}
            onSaved={handleSaved}
          />
        </div>
      )}
    </div>
  );
}
