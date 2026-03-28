import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ChipProps = {
  children: ReactNode;
  variant?: "default" | "primary" | "muted";
  /** Chip interactivo con botón quitar */
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
};

export function Chip({
  children,
  variant = "default",
  onRemove,
  removeLabel = "Quitar",
  className,
}: ChipProps) {
  const base = cn(
    "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-interactive",
    variant === "default" &&
      "border-border/80 bg-muted/50 text-foreground hover:bg-muted/80",
    variant === "primary" &&
      "border-primary/30 bg-primary/10 text-foreground hover:border-primary/45 hover:bg-primary/15 dark:border-primary/35 dark:bg-primary/18",
    variant === "muted" &&
      "border-transparent bg-muted/70 text-muted-foreground hover:text-foreground",
  );

  if (onRemove) {
    return (
      <span className={cn(base, className)}>
        <span className="min-w-0 truncate">{children}</span>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background/90 text-base leading-none text-muted-foreground transition hover:bg-background hover:text-foreground dark:bg-background/50"
          aria-label={removeLabel}
        >
          ×
        </button>
      </span>
    );
  }

  return <span className={cn(base, className)}>{children}</span>;
}

type ChipButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary";
};

/** Chip como botón (filtros, toggles). */
export function ChipButton({
  className,
  variant = "default",
  ...props
}: ChipButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-interactive",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variant === "default" &&
          "border-border bg-card hover:border-primary/30 hover:bg-muted/50",
        variant === "primary" &&
          "border-primary/40 bg-primary/10 text-foreground hover:bg-primary/18",
        className,
      )}
      {...props}
    />
  );
}
