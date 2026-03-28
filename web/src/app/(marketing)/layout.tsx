import type { ReactNode } from "react";

import { auth } from "@/auth";
import { LandingShell } from "@/components/marketing/landing-shell";

export default async function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  return <LandingShell session={session}>{children}</LandingShell>;
}
