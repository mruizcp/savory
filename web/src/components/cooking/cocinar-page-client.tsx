"use client";

import { useCallback, useMemo, useState } from "react";

import { RecipeGeneratorClient } from "@/app/(app)/recetas/recipe-generator-client";
import { ManualIngredientsSection } from "@/components/ingredients/manual-ingredients-section";
import { PantryRecipeSuggestions } from "@/components/ingredients/pantry-recipe-suggestions";
import { PhotoIngredientsSection } from "@/components/ingredients/photo-ingredients-section";
import { Container } from "@/components/ui/container";
import { mergeIngredientLists } from "@/lib/cooking/merge-ingredients";
import { useI18n } from "@/lib/i18n/i18n-context";

type CocinarPageClientProps = {
  canPersist: boolean;
};

export function CocinarPageClient({ canPersist }: CocinarPageClientProps) {
  const { t } = useI18n();
  const [manual, setManual] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string[]>([]);

  const setManualStable = useCallback((items: string[]) => {
    setManual(items);
  }, []);

  const setPhotoStable = useCallback((items: string[]) => {
    setPhoto(items);
  }, []);

  const merged = useMemo(
    () => mergeIngredientLists(manual, photo),
    [manual, photo],
  );

  return (
    <Container className="py-6 sm:py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {t("cooking.pageTitle")}
      </h1>
      <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
        {t("cooking.pageDescription")}
      </p>

      <ManualIngredientsSection onIngredientsChange={setManualStable} />
      <PhotoIngredientsSection onIngredientsChange={setPhotoStable} />

      <PantryRecipeSuggestions active={merged.length > 0} ingredients={merged} />

      <div id="generar-recetas" className="mt-12 scroll-mt-24">
        <RecipeGeneratorClient
          canPersist={canPersist}
          syncedIngredientList={merged}
        />
      </div>
    </Container>
  );
}
