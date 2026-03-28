import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "min-h-9 rounded-lg px-3 text-xs",
  md: "min-h-11 rounded-xl px-4 text-sm",
  lg: "min-h-12 rounded-2xl px-6 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-interactive",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        sizeClasses[size],
        variant === "primary" &&
          "bg-primary text-primary-foreground shadow-sm hover:brightness-[1.03] dark:hover:brightness-110",
        variant === "secondary" &&
          "border border-border bg-card text-foreground shadow-sm hover:bg-muted/90",
        variant === "ghost" &&
          "text-foreground hover:bg-muted/80",
        variant === "outline" &&
          "border-2 border-primary/35 bg-transparent text-foreground hover:border-primary/55 hover:bg-card/80",
        className,
      )}
      {...props}
    />
  );
}
