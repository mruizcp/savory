"use client";

import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { useI18n } from "@/lib/i18n/i18n-context";

/** Foto editorial (Unsplash); decorativa. */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1495521821757-ae1c2aa3acf8?auto=format&fit=crop&w=1920&q=80";

type HomeHeroProps = {
  isSignedIn: boolean;
};

export function HomeHero({ isSignedIn }: HomeHeroProps) {
  const { t } = useI18n();

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/78 to-background/35 dark:from-background/98 dark:via-background/88 dark:to-background/45"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent dark:from-background"
          aria-hidden
        />
      </div>

      <div className="relative mx-auto flex min-h-[min(82vh,38rem)] max-w-lg flex-col justify-end px-4 pb-16 pt-28 sm:max-w-3xl sm:px-6 sm:pb-20 sm:pt-32 lg:max-w-4xl lg:pb-24">
        <p className="motion-safe:animate-fade-in text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {t("home.heroEyebrow")}
        </p>
        <h1 className="motion-safe:animate-fade-in mt-3 max-w-[17ch] text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:max-w-[20ch] sm:text-5xl lg:text-[3.25rem]">
          {t("home.heroTitleBefore")}{" "}
          <span className="text-primary">{t("home.heroTitleHighlight")}</span>
        </h1>
        <p className="motion-safe:animate-fade-in mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("home.heroSubtitle")}
        </p>

        <div className="motion-safe:animate-fade-in mt-10 flex max-w-lg flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <ButtonLink href="/cocinar#manual" size="lg" variant="primary">
            {t("home.ctaAddIngredients")}
          </ButtonLink>
          <ButtonLink href="/cocinar#desde-foto" size="lg" variant="outline">
            {t("home.ctaScanPhoto")}
          </ButtonLink>
        </div>

        {!isSignedIn ? (
          <p className="motion-safe:animate-fade-in mt-8 text-sm text-muted-foreground">
            {t("home.alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 transition hover:underline"
            >
              {t("home.signIn")}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
