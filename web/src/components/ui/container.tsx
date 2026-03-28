import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Container({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-lg px-4 sm:max-w-3xl sm:px-6 lg:max-w-4xl",
        className,
      )}
      {...props}
    />
  );
}
