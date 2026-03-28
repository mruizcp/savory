"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/i18n-context";

type SignOutButtonProps = {
  className?: string;
  variant?: "secondary" | "ghost";
};

export function SignOutButton({
  className,
  variant = "secondary",
}: SignOutButtonProps) {
  const { t } = useI18n();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await signOut({ redirectTo: "/" });
    } catch {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={pending}
      onClick={handleClick}
    >
      {pending ? t("auth.signingOut") : t("auth.signOutSession")}
    </Button>
  );
}
