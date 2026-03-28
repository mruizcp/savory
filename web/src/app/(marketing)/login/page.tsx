import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/config/site";
import { getSafeCallbackUrl } from "@/lib/auth/callback-url";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { isDatabaseConfigured } from "@/server/env/is-database-configured";

export const metadata: Metadata = {
  title: `Iniciar sesión · ${siteConfig.name}`,
};

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
    registered?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const callbackUrl = getSafeCallbackUrl(sp.callbackUrl);
  const errorMessage = sp.error ? getAuthErrorMessage(sp.error) : null;
  const databaseConfigured = isDatabaseConfigured();
  const registeredBanner = sp.registered === "1";

  return (
    <Container className="flex min-h-[min(70vh,36rem)] flex-col justify-center py-8 sm:py-12">
      <AuthCard
        variant="sign-in"
        databaseConfigured={databaseConfigured}
        callbackUrl={callbackUrl}
        registeredBanner={registeredBanner}
        errorMessage={errorMessage}
      />
    </Container>
  );
}
