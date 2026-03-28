import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";
import { getSafeCallbackUrl } from "@/lib/auth/callback-url";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";

export const metadata: Metadata = {
  title: `Crear cuenta · ${siteConfig.name}`,
};

type RegistroPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function RegistroPage({ searchParams }: RegistroPageProps) {
  const sp = await searchParams;
  const callbackUrl = getSafeCallbackUrl(sp.callbackUrl);
  const errorMessage = sp.error ? getAuthErrorMessage(sp.error) : null;
  const databaseConfigured = isDatabaseConfigured();

  return (
    <Container className="flex min-h-[min(70vh,36rem)] flex-col justify-center py-8 sm:py-12">
      <AuthCard
        variant="sign-up"
        databaseConfigured={databaseConfigured}
        callbackUrl={callbackUrl}
        errorMessage={errorMessage}
      />
    </Container>
  );
}
