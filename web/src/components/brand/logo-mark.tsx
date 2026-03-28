"use client";

import { useId } from "react";

import { cn } from "@/lib/utils/cn";

type LogoMarkProps = {
  className?: string;
  size?: number;
};

/**
 * Marca Savory: monograma S sobre fondo con gradiente.
 */
export function LogoMark({ className, size = 36 }: LogoMarkProps) {
  const gid = useId().replace(/:/g, "");
  const gradId = `savoryLogoGrad-${gid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill={`url(#${gradId})`} />
      <text
        x="20"
        y="28"
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        S
      </text>
    </svg>
  );
}
