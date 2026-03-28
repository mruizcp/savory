"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils/cn";

function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function MarketingLanding() {
  const { t } = useI18n();

  const features = [
    { title: t("landingPage.feat1Title"), desc: t("landingPage.feat1Desc") },
    { title: t("landingPage.feat2Title"), desc: t("landingPage.feat2Desc") },
    { title: t("landingPage.feat3Title"), desc: t("landingPage.feat3Desc") },
    { title: t("landingPage.feat4Title"), desc: t("landingPage.feat4Desc") },
    { title: t("landingPage.feat5Title"), desc: t("landingPage.feat5Desc") },
    { title: t("landingPage.feat6Title"), desc: t("landingPage.feat6Desc") },
  ];

  const steps = [
    { n: 1, title: t("landingPage.step1Title"), desc: t("landingPage.step1Desc") },
    { n: 2, title: t("landingPage.step2Title"), desc: t("landingPage.step2Desc") },
    { n: 3, title: t("landingPage.step3Title"), desc: t("landingPage.step3Desc") },
  ];

  return (
    <div>
      {/* Hero — estilo landing SaaS (referencia: getdealerflowai.com/landing) */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/[0.07] via-background to-background pb-20 pt-12 dark:from-primary/15 sm:pb-28 sm:pt-16">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/20 to-transparent dark:from-primary/30"
          aria-hidden
        />
        <Container className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {t("landingPage.heroEyebrow")}
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.15rem]">
            {t("landingPage.heroTitle")}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("landingPage.heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <ButtonLink
              href="/registro?trial=7"
              size="lg"
              variant="primary"
              className="min-h-12 px-8 text-base shadow-lg shadow-primary/20"
            >
              {t("landingPage.heroCtaPrimary")}
            </ButtonLink>
            <a
              href="#planes"
              className="text-center text-base font-semibold text-primary underline-offset-4 hover:underline sm:text-left"
            >
              {t("landingPage.heroCtaSecondary")}
            </a>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{t("landingPage.heroMicrocopy")}</p>
        </Container>
      </section>

      {/* Pain points */}
      <section className="border-b border-border/50 bg-muted/15 py-16 dark:bg-muted/10 sm:py-24">
        <Container>
          <SectionTitle className="max-w-3xl">{t("landingPage.problemTitle")}</SectionTitle>
          <ul className="mt-12 grid gap-8 sm:grid-cols-3">
            <li className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-foreground">{t("landingPage.problem1Title")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("landingPage.problem1Body")}
              </p>
            </li>
            <li className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-foreground">{t("landingPage.problem2Title")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("landingPage.problem2Body")}
              </p>
            </li>
            <li className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-foreground">{t("landingPage.problem3Title")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("landingPage.problem3Body")}
              </p>
            </li>
          </ul>
        </Container>
      </section>

      {/* Solution */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <SectionTitle>{t("landingPage.solutionTitle")}</SectionTitle>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("landingPage.solutionBody")}
            </p>
          </div>
          <ul className="mx-auto mt-12 max-w-2xl space-y-4 text-left text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
              {t("landingPage.solutionBullet1")}
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
              {t("landingPage.solutionBullet2")}
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
              {t("landingPage.solutionBullet3")}
            </li>
          </ul>
        </Container>
      </section>

      {/* Features grid */}
      <section className="border-y border-border/50 bg-muted/10 py-16 dark:bg-muted/5 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionTitle>{t("landingPage.featuresTitle")}</SectionTitle>
            <p className="mt-4 text-muted-foreground">{t("landingPage.featuresSubtitle")}</p>
          </div>
          <ul className="mt-14 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <li
                key={f.title}
                className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition hover:border-primary/25 hover:shadow-md"
              >
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Steps */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionTitle className="text-center">{t("landingPage.stepsTitle")}</SectionTitle>
          <ol className="mt-14 grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="relative rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm">
                <span
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground"
                  aria-hidden
                >
                  {s.n}
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Pricing */}
      <section id="planes" className="scroll-mt-20 border-t border-border/50 bg-muted/15 py-16 dark:bg-muted/10 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionTitle>{t("landingPage.pricingTitle")}</SectionTitle>
            <p className="mt-4 text-muted-foreground">{t("landingPage.pricingSubtitle")}</p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{t("landingPage.planStarterName")}</h3>
              <p className="mt-2 text-3xl font-bold text-foreground">{t("landingPage.planStarterPrice")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("landingPage.planStarterDesc")}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
                <li>• {t("landingPage.planStarterB1")}</li>
                <li>• {t("landingPage.planStarterB2")}</li>
                <li>• {t("landingPage.planStarterB3")}</li>
              </ul>
              <ButtonLink href="/registro" variant="outline" className="mt-8 w-full">
                {t("landingPage.planStarterCta")}
              </ButtonLink>
            </div>

            <div
              className={cn(
                "relative flex flex-col rounded-2xl border-2 border-primary bg-card p-6 shadow-lg shadow-primary/10",
              )}
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {t("landingPage.planGrowthBadge")}
              </span>
              <h3 className="mt-2 text-lg font-semibold">{t("landingPage.planGrowthName")}</h3>
              <p className="mt-2 text-3xl font-bold text-foreground">{t("landingPage.planGrowthPrice")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("landingPage.planGrowthDesc")}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
                <li>• {t("landingPage.planGrowthB1")}</li>
                <li>• {t("landingPage.planGrowthB2")}</li>
                <li>• {t("landingPage.planGrowthB3")}</li>
              </ul>
              <ButtonLink href="/registro?trial=7" variant="primary" className="mt-8 w-full">
                {t("landingPage.planGrowthCta")}
              </ButtonLink>
            </div>

            <div className="flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{t("landingPage.planProName")}</h3>
              <p className="mt-2 text-3xl font-bold text-foreground">{t("landingPage.planProPrice")}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t("landingPage.planProDesc")}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
                <li>• {t("landingPage.planProB1")}</li>
                <li>• {t("landingPage.planProB2")}</li>
                <li>• {t("landingPage.planProB3")}</li>
              </ul>
              <span className="mt-8 block w-full rounded-xl border border-border py-3 text-center text-sm font-medium text-muted-foreground">
                {t("landingPage.planProCta")}
              </span>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
            {t("landingPage.pricingFootnote")}
          </p>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/50 bg-gradient-to-b from-primary/[0.08] to-background py-20 dark:from-primary/15 sm:py-28">
        <Container className="text-center">
          <SectionTitle className="mx-auto max-w-2xl">{t("landingPage.ctaFinalTitle")}</SectionTitle>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">{t("landingPage.ctaFinalBody")}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/registro?trial=7" size="lg" variant="primary" className="min-h-12 px-10">
              {t("landingPage.ctaFinalPrimary")}
            </ButtonLink>
            <Link
              href="/login"
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {t("landingPage.ctaFinalSecondary")}
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
