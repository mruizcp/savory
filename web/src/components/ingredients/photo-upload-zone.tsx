"use client";

import Image from "next/image";
import { useCallback, useId, useRef, useState } from "react";

import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils/cn";

type PhotoUploadZoneProps = {
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
};

export function PhotoUploadZone({
  previewUrl,
  onFileChange,
  disabled = false,
}: PhotoUploadZoneProps) {
  const { t } = useI18n();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openPicker = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFileChange(event.target.files?.[0] ?? null);
    },
    [onFileChange],
  );

  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      const f = e.dataTransfer.files?.[0];
      if (f?.type.startsWith("image/")) {
        onFileChange(f);
      }
    },
    [disabled, onFileChange],
  );

  return (
    <div className="w-full max-w-2xl">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onInputChange}
        disabled={disabled}
        aria-label={t("ingredients.photoUploadAria")}
      />

      <button
        type="button"
        onClick={openPicker}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        disabled={disabled}
        className={cn(
          "group relative w-full overflow-hidden rounded-3xl border-2 border-dashed text-left transition-interactive",
          "border-border/90 bg-card/90 shadow-soft",
          "hover:border-primary/45 hover:shadow-card dark:hover:shadow-card-dark",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:scale-[0.995] motion-reduce:active:scale-100",
          isDragging && "scale-[1.01] border-primary bg-primary/8 ring-2 ring-primary/25",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {previewUrl ? (
          <div className="relative aspect-[5/4] w-full sm:aspect-[16/10]">
            <Image
              src={previewUrl}
              alt={t("ingredients.photoPreviewAlt")}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, 42rem"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
              <p className="max-w-[14rem] text-sm font-semibold text-white drop-shadow-md">
                {t("ingredients.photoTapToChange")}
              </p>
              <span className="rounded-full bg-white/25 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-md">
                {t("ingredients.photoChange")}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 px-6 py-16 sm:py-20">
            <div
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/12 text-primary transition-interactive",
                "group-hover:scale-105 group-hover:bg-primary/18 dark:bg-primary/22",
              )}
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-10 w-10"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039l-1.125.016a2.25 2.25 0 01-2.145-2.052l-.093-1.125z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18 10.5h.008v.008H18V10.5z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {t("ingredients.photoDropTitle")}
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {t("ingredients.photoDropHint")}
              </p>
            </div>
            <span className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/25 transition group-hover:brightness-105">
              {t("ingredients.photoChooseFile")}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
