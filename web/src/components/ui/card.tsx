import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "elevated" | "outline" | "ghost" | "glass";
};

export function Card({
  className,
  variant = "elevated",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200 ease-out",
        variant === "elevated" &&
          "border-border/60 bg-card text-card-foreground shadow-card ring-1 ring-black/[0.03] dark:shadow-card-dark dark:ring-white/[0.06]",
        variant === "outline" &&
          "border-border/80 bg-transparent shadow-none",
        variant === "ghost" && "border-transparent bg-muted/35 shadow-none",
        variant === "glass" &&
          "border-white/20 bg-card/70 shadow-elevate backdrop-blur-md dark:border-white/10 dark:bg-card/60 dark:shadow-elevate-dark",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-6 pb-0", className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-tight tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-4", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
  );
}

type CardSectionProps = {
  children: ReactNode;
  className?: string;
};

export function CardSection({ children, className }: CardSectionProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
