"use client";

import { useEffect, useState } from "react";

import { IngredientsEditor } from "@/components/ingredients/ingredients-editor";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-context";

type ManualFeedback =
  | { kind: "success" }
  | { kind: "error"; source: "empty" | "network" | "generic" | "api"; apiMessage?: string };

type ManualIngredientsSectionProps = {
  onIngredientsChange?: (ingredients: string[]) => void;
};

export function ManualIngredientsSection({
  onIngredientsChange,
}: ManualIngredientsSectionProps = {}) {
  const { t } = useI18n();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<ManualFeedback | null>(null);

  useEffect(() => {
    onIngredientsChange?.(ingredients);
  }, [ingredients, onIngredientsChange]);

  function feedbackText(f: ManualFeedback): string {
    if (f.kind === "success") return t("ingredients.saveSuccess");
    if (f.source === "empty") return t("ingredients.saveErrorEmpty");
    if (f.source === "network") return t("ingredients.saveNetworkError");
    if (f.source === "api" && f.apiMessage) return f.apiMessage;
    return t("ingredients.saveErrorGeneric");
  }

  async function handleSave() {
    if (ingredients.length === 0) {
      setFeedback({ kind: "error", source: "empty" });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/ingredients/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "MANUAL",
          ingredientNames: ingredients,
        }),
      });
      const data = (await res.json()) as { error?: string; sessionId?: string };
      if (!res.ok) {
        setFeedback({
          kind: "error",
          source: data.error ? "api" : "generic",
          apiMessage: data.error,
        });
        return;
      }
      setFeedback({ kind: "success" });
    } catch {
      setFeedback({ kind: "error", source: "network" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="manual"
      className="relative scroll-mt-24 mt-8 overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-card dark:shadow-card-dark sm:p-8"
    >
      <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
      <header className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("ingredients.manualEyebrow")}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          {t("ingredients.manualTitle")}
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t("ingredients.manualSubtitle")}
        </p>
      </header>

      <div className="relative mt-6">
        <IngredientsEditor onChange={setIngredients} />
      </div>

      <div className="relative mt-6 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={loading || ingredients.length === 0}
        >
          {loading ? t("ingredients.saving") : t("ingredients.saveList")}
        </Button>
      </div>
      {feedback ? (
        <p
          className={
            feedback.kind === "success"
              ? "relative mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-400"
              : "relative mt-4 text-sm text-amber-800 dark:text-amber-300"
          }
          role="status"
        >
          {feedbackText(feedback)}
        </p>
      ) : null}
    </section>
  );
}
