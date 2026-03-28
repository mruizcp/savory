import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "min-h-9 rounded-lg px-3 text-xs",
  md: "min-h-11 rounded-xl px-4 text-sm",
  lg: "min-h-12 rounded-2xl px-6 text-sm",
};

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-interactive",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
        sizeClasses[size],
        variant === "primary" &&
          "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:brightness-[1.03] dark:hover:brightness-110",
        variant === "secondary" &&
          "border border-border bg-card text-foreground shadow-sm hover:bg-muted/80",
        variant === "outline" &&
          "border-2 border-primary/35 bg-card/90 text-foreground backdrop-blur-sm hover:border-primary/50 hover:bg-card",
        className,
      )}
      {...props}
    />
  );
}
