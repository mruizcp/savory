"use client";

import { SmartRecommendations } from "@/components/recommendations/smart-recommendations";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/i18n-context";

type HomePageContentProps = {
  isSignedIn: boolean;
};

export function HomePageContent({ isSignedIn }: HomePageContentProps) {
  const { t } = useI18n();

  return (
    <div className="pb-10 pt-10 sm:pb-14 sm:pt-12">
      {!isSignedIn ? (
        <Card
          variant="elevated"
          className="overflow-hidden bg-gradient-to-br from-card via-card to-muted/25 p-6 sm:p-8"
        >
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t("home.guestTitle")}
          </h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("home.guestDescription")}
          </p>
          <ButtonLink href="/login" className="mt-6" size="lg" variant="primary">
            {t("home.signInCta")}
          </ButtonLink>
        </Card>
      ) : (
        <SmartRecommendations />
      )}
    </div>
  );
}
