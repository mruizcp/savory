import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

/** Bottom padding reserves space for the mobile bottom navigation + safe area. */
export function AppMain({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={cn(
        "flex-1 bg-gradient-to-b from-background via-background to-muted/40 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] dark:from-background dark:via-background dark:to-muted/25 sm:pb-10",
        className,
      )}
      {...props}
    />
  );
}
