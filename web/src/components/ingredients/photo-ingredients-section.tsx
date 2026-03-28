"use client";

import { useEffect, useMemo, useState } from "react";

import { IngredientsEditor } from "@/components/ingredients/ingredients-editor";
import { PhotoUploadZone } from "@/components/ingredients/photo-upload-zone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PhotoIngredientsAnalysisResponse } from "@/features/ingredients";
import { useI18n } from "@/lib/i18n/i18n-context";

function friendlyDetectionNote(
  note: string | null | undefined,
  t: (key: string) => string,
): string | null {
  if (!note?.trim()) return null;
  if (note.includes("OPENAI_API_KEY")) {
    return t("ingredients.photoDetectionBasic");
  }
  return note.trim();
}

type SaveFeedback =
  | { kind: "success" }
  | { kind: "error"; source: "generic" | "api" | "network"; apiMessage?: string };

function StepBadge({ n }: { n: number }) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md shadow-primary/20"
      aria-hidden
    >
      {n}
    </span>
  );
}

type PhotoIngredientsSectionProps = {
  onIngredientsChange?: (ingredients: string[]) => void;
};

export function PhotoIngredientsSection({
  onIngredientsChange,
}: PhotoIngredientsSectionProps = {}) {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhotoIngredientsAnalysisResponse | null>(
    null,
  );
  const [editedList, setEditedList] = useState<string[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<SaveFeedback | null>(null);

  const syncIngredients = useMemo(
    () => analysis?.detectedIngredients ?? [],
    [analysis?.detectedIngredients],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (analysis) {
      setEditedList(analysis.detectedIngredients);
    }
  }, [analysis]);

  useEffect(() => {
    onIngredientsChange?.(editedList);
  }, [editedList, onIngredientsChange]);

  const isDirty = useMemo(() => {
    if (!analysis) return false;
    const a = [...analysis.detectedIngredients].sort().join("|");
    const b = [...editedList].sort().join("|");
    return a !== b;
  }, [analysis, editedList]);

  const friendlyNote = useMemo(
    () => friendlyDetectionNote(analysis?.detectionNote, t),
    [analysis?.detectionNote, t],
  );

  function saveFeedbackText(f: SaveFeedback): string {
    if (f.kind === "success") return t("ingredients.saveEditedSuccess");
    if (f.source === "network") return t("ingredients.saveEditedGenericError");
    if (f.source === "api" && f.apiMessage) return f.apiMessage;
    return t("ingredients.saveEditedError");
  }

  async function handleAnalyze() {
    if (!file) {
      setError(t("ingredients.photoErrorNoFile"));
      return;
    }

    setError(null);
    setSaveFeedback(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("image", file);

      const response = await fetch("/api/ingredients/photo-analysis", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as PhotoIngredientsAnalysisResponse & {
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? t("ingredients.photoErrorRead"));
        setLoading(false);
        return;
      }

      setAnalysis(payload);
    } catch {
      setError(t("ingredients.photoErrorNetwork"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEditedList() {
    if (!analysis || editedList.length === 0) return;
    setSaveLoading(true);
    setSaveFeedback(null);
    try {
      const res = await fetch("/api/ingredients/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "PHOTO",
          imageUrl: analysis.imageUrl,
          storageProvider: analysis.storageProvider,
          detectionProvider: analysis.detectionProvider,
          ingredientNames: editedList,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setSaveFeedback({
          kind: "error",
          source: data.error ? "api" : "generic",
          apiMessage: data.error,
        });
        return;
      }
      setSaveFeedback({ kind: "success" });
    } catch {
      setSaveFeedback({ kind: "error", source: "network" });
    } finally {
      setSaveLoading(false);
    }
  }

  function handleFileChange(nextFile: File | null) {
    setFile(nextFile);
    setAnalysis(null);
    setError(null);
    setSaveFeedback(null);

    if (!nextFile) {
      setPreviewUrl(null);
      return;
    }

    setPreviewUrl(URL.createObjectURL(nextFile));
  }

  return (
    <section id="desde-foto" className="relative scroll-mt-24 mt-10">
      <div className="pointer-events-none absolute inset-x-0 -mt-10 h-40 max-w-4xl bg-gradient-to-b from-primary/8 to-transparent blur-3xl dark:from-primary/12" />

      <Card className="relative overflow-hidden border-border/50 p-0 motion-safe:animate-fade-in">
        <div className="relative border-b border-border/40 bg-gradient-to-br from-card via-card to-muted/20 px-5 py-8 dark:to-muted/10 sm:px-8 sm:py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            {t("ingredients.photoEyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("ingredients.photoTitle")}
          </h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("ingredients.photoSubtitle")}
          </p>
        </div>

        <div className="space-y-4 px-5 py-4 sm:px-8">
          {error ? (
            <p
              className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-100"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {friendlyNote ? (
            <p
              className="rounded-2xl border border-amber-500/35 bg-amber-500/[0.08] px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-50"
              role="status"
            >
              {friendlyNote}
            </p>
          ) : null}
          {analysis?.persisted ? (
            <p
              className="text-sm font-medium text-emerald-700 dark:text-emerald-400"
              role="status"
            >
              {t("ingredients.photoAutoSaved")}
            </p>
          ) : null}
        </div>

        <div className="grid gap-10 px-5 pb-8 pt-2 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pb-10">
          <div className="space-y-10">
            <div>
              <div className="flex items-start gap-4">
                <StepBadge n={1} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("ingredients.stepCapture")}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("ingredients.stepCaptureHint")}
                  </p>
                </div>
              </div>
              <div className="mt-5 pl-0 sm:pl-[3.25rem]">
                <PhotoUploadZone
                  previewUrl={previewUrl}
                  onFileChange={handleFileChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4">
                <StepBadge n={2} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("ingredients.stepAnalyze")}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("ingredients.stepAnalyzeHint")}
                  </p>
                </div>
              </div>
              <div className="mt-5 pl-0 sm:pl-[3.25rem]">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={loading || !file}
                  className="w-full max-w-md sm:w-auto"
                >
                  {loading ? t("ingredients.analyzing") : t("ingredients.analyzeButton")}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-start gap-4">
                <StepBadge n={3} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("ingredients.stepPantry")}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("ingredients.stepPantryHint")}
                  </p>
                </div>
              </div>
              <div className="mt-5 pl-0 sm:pl-[3.25rem]">
                <IngredientsEditor
                  key={analysis?.imageUrl ?? "empty"}
                  initialIngredients={syncIngredients}
                  onChange={setEditedList}
                  emptyMessage={t("ingredients.listFromPhoto")}
                  listHeading={t("ingredients.listHeadingShort")}
                  inputPlaceholder={t("ingredients.placeholderAdd")}
                />

                {analysis && isDirty ? (
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={() => void handleSaveEditedList()}
                      disabled={saveLoading || editedList.length === 0}
                    >
                      {saveLoading
                        ? t("ingredients.savingChanges")
                        : t("ingredients.saveChanges")}
                    </Button>
                    {saveFeedback ? (
                      <p className="text-sm text-muted-foreground" role="status">
                        {saveFeedbackText(saveFeedback)}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
