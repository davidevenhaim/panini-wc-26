"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import AnimatedNumber from "@/components/ui/animations/animated-number";
import { AppearIn } from "@/components/ui/animations/appear-in";
import { GradientText } from "@/components/ui/animations/gradient-text";
import { InfinityBrandMarquee } from "@/components/ui/animations/infinity-brand-marquee";
import { SpotlightCard } from "@/components/ui/animations/spotlight-card";
import { HeroCarousel, type HeroSlide } from "@/components/ui/animations/hero-carousel";
import { DemoStackingCards } from "@/components/demo/demo-stacking-cards";
import { LandingPricingSection } from "@/components/demo/landing-pricing-section";
import { RotatingTypewriterText } from "@/components/ui/animations/rotating-typewriter-text";
import { TypewriterText } from "@/components/ui/animations/typewriter-text";
import { Button } from "@/components/ui/button";
import { FaqSection, type FaqItem } from "@/components/ui/faq-section";
import { HeroWithBackgroundImage } from "@/components/ui/hero-with-background-image";
import { RandomizedTextEffect } from "@/components/ui/text-randomized";
import { Typography } from "@/components/ui/typography";
import { GITHUB_URL } from "@/constants/app.constants";
import {
  LANDING_DEMO_HERO_IMAGE_DARK,
  LANDING_DEMO_HERO_IMAGE_LIGHT,
} from "@/constants/landing-media.constants";
import { GUIDE_SECTION_ID } from "@/constants/guide-sections.constants";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { useInView } from "@/hooks/use-in-view";
import { openLinkInNewTab } from "@/utils/general.utils";

const POWERED_BY_BRANDS = [
  { id: "next", icon: "logos:nextjs-icon", label: "Next.js" },
  { id: "react", icon: "logos:react", label: "React" },
  { id: "typescript", icon: "logos:typescript-icon", label: "TypeScript" },
  { id: "tailwind", icon: "logos:tailwindcss-icon", label: "Tailwind CSS" },
  { id: "zod", icon: "simple-icons:zod", label: "Zod" },
  { id: "swr", icon: "simple-icons:swr", label: "SWR" },
  { id: "radix", icon: "simple-icons:radixui", label: "Radix UI" },
  { id: "zustand", icon: "simple-icons:zustand", label: "Zustand" },
  { id: "vitest", icon: "logos:vitest", label: "Vitest" },
  { id: "intl", icon: "lucide:languages", label: "next-intl" },
  { id: "eslint", icon: "logos:eslint", label: "ESLint" },
  { id: "prettier", icon: "logos:prettier", label: "Prettier" },
] as const;

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView(0.5);
  return (
    <div ref={ref} className="text-center">
      <Typography variant="h2" className="text-4xl font-bold tabular-nums md:text-5xl">
        {inView ? <AnimatedNumber value={value} duration={1200} /> : "0"}
        <span>{suffix}</span>
      </Typography>
      <Typography variant="caption1" className="text-muted-foreground mt-1 block text-sm">
        {label}
      </Typography>
    </div>
  );
}

export function DemoLandingTab() {
  const t = useTranslations("demo");

  const heroAccentPhrases = useMemo(
    () => [
      t("landing.heroAccentRotate1"),
      t("landing.heroAccentRotate2"),
      t("landing.heroAccentRotate3"),
    ],
    [t]
  );

  const typewriterPhrases = [
    t("landing.typewriterPhrase1"),
    t("landing.typewriterPhrase2"),
    t("landing.typewriterPhrase3"),
    t("landing.typewriterPhrase4"),
  ];

  const heroSlides: HeroSlide[] = [
    {
      visual: (
        <div className="h-full w-full bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700">
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_30%_50%,white_0%,transparent_60%)] opacity-20 mix-blend-overlay" />
        </div>
      ),
      title: t("landing.heroSlide1Title"),
      description: t("landing.heroSlide1Desc"),
      actionText: t("landing.heroSlide1Cta"),
    },
    {
      visual: (
        <div className="h-full w-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_30%_50%,white_0%,transparent_60%)] opacity-20 mix-blend-overlay" />
        </div>
      ),
      title: t("landing.heroSlide2Title"),
      description: t("landing.heroSlide2Desc"),
      actionText: t("landing.heroSlide2Cta"),
    },
    {
      visual: (
        <div className="h-full w-full bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700">
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_30%_50%,white_0%,transparent_60%)] opacity-20 mix-blend-overlay" />
        </div>
      ),
      title: t("landing.heroSlide3Title"),
      description: t("landing.heroSlide3Desc"),
      actionText: t("landing.heroSlide3Cta"),
    },
    {
      visual: (
        <div className="h-full w-full bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700">
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_30%_50%,white_0%,transparent_60%)] opacity-20 mix-blend-overlay" />
        </div>
      ),
      title: t("landing.heroSlide4Title"),
      description: t("landing.heroSlide4Desc"),
      actionText: t("landing.heroSlide4Cta"),
    },
  ];

  const stats = [
    { value: 3, suffix: "", label: t("landing.stat1Label") },
    { value: 50, suffix: "+", label: t("landing.stat2Label") },
    { value: 19, suffix: "", label: t("landing.stat3Label") },
    { value: 100, suffix: "%", label: t("landing.stat4Label") },
  ];

  const motionStackCards = useMemo(
    () => [
      {
        title: t("landing.motionStackCard1Title"),
        description: t("landing.motionStackCard1Desc"),
        imageUrl:
          "https://images.unsplash.com/photo-1605106702842-01a887a31122?q=80&w=900&auto=format&fit=crop",
        color: "#5196fd",
      },
      {
        title: t("landing.motionStackCard2Title"),
        description: t("landing.motionStackCard2Desc"),
        imageUrl:
          "https://images.unsplash.com/photo-1605106250963-ffda6d2a4b32?w=900&auto=format&fit=crop&q=60",
        color: "#8f89ff",
      },
      {
        title: t("landing.motionStackCard3Title"),
        description: t("landing.motionStackCard3Desc"),
        imageUrl:
          "https://images.unsplash.com/photo-1605106901227-991bd663255c?w=900&auto=format&fit=crop",
        color: "#645FB2",
      },
    ],
    [t]
  );

  const features = [
    { icon: "📋", title: t("landing.feature1Title"), desc: t("landing.feature1Desc") },
    { icon: "⚡", title: t("landing.feature2Title"), desc: t("landing.feature2Desc") },
    { icon: "🌐", title: t("landing.feature3Title"), desc: t("landing.feature3Desc") },
  ];

  const faqItems: FaqItem[] = [
    { id: "purpose", question: t("landing.faq1Q"), answer: t("landing.faq1A") },
    { id: "demo-routes", question: t("landing.faq2Q"), answer: t("landing.faq2A") },
    { id: "i18n", question: t("landing.faq3Q"), answer: t("landing.faq3A") },
    { id: "data", question: t("landing.faq4Q"), answer: t("landing.faq4A") },
    { id: "auth", question: t("landing.faq5Q"), answer: t("landing.faq5A") },
  ];

  return (
    <div className="overflow-x-clip">
      {/* ── Hero ────────────────────────────────────────────── */}
      <HeroWithBackgroundImage
        backgroundImageSrc={LANDING_DEMO_HERO_IMAGE_DARK}
        backgroundImageSrcLight={LANDING_DEMO_HERO_IMAGE_LIGHT}
        backgroundImageAlt={t("landing.heroBackgroundAlt")}
        backgroundOpacity={0.7}
        imagePosition="center 85%"
      >
        <AppearIn className="mx-auto max-w-3xl space-y-6">
          <div className="border-border/60 bg-background/75 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 shadow-sm backdrop-blur-md">
            <Typography variant="label1" className="text-sm">
              ✨ {t("landing.heroBadge")}
            </Typography>
          </div>
          <Typography
            variant="h1"
            className="text-4xl leading-tight font-bold drop-shadow-sm md:text-6xl"
          >
            {t("landing.heroTitle")}
            {/* Desktop: prefix inline with title on line 1 */}
            <span className="hidden md:inline">
              {" "}
              <GradientText>{t("landing.heroAccentPrefix")}</GradientText>
            </span>
            {/* Block below: mobile shows prefix + rotating together; desktop shows only rotating */}
            <GradientText className="block">
              <span className="md:hidden">{t("landing.heroAccentPrefix")} </span>
              <RotatingTypewriterText phrases={heroAccentPhrases} />
            </GradientText>
          </Typography>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button size="lg" asChild>
              <Link href={`${WEB_ROUTES.DEMO_GUIDE}#${GUIDE_SECTION_ID.getStarted}`}>
                {t("landing.heroCta")}
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={() => openLinkInNewTab(GITHUB_URL)}>
              {t("landing.heroSecondary")}
            </Button>
          </div>
          <Typography
            variant="body1"
            className="text-muted-foreground mx-auto max-w-xl text-xl leading-relaxed drop-shadow-sm"
          >
            <TypewriterText phrases={typewriterPhrases} />
          </Typography>
        </AppearIn>
      </HeroWithBackgroundImage>

      {/* ── Infinity Brand Marquee ──────────────────────────── */}
      <section className="from-muted/30 via-background to-background border-y bg-gradient-to-b py-14 md:py-16">
        <InfinityBrandMarquee
          brands={POWERED_BY_BRANDS}
          label={t("landing.marqueeTitle")}
          speed={35}
          gap={0.75}
          repeat={4}
        />
      </section>

      {/* ── Hero Carousel ───────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <HeroCarousel slides={heroSlides} interval={5000} />
      </section>

      {/* ── Stacking cards (UI Layouts / Framer-style) ───────── */}
      <DemoStackingCards
        introTitle={t("landing.motionStackIntroTitle")}
        introHint={t("landing.motionStackIntroHint")}
        cards={motionStackCards}
        imageAlt={t("landing.motionStackImageAlt")}
        seeMoreLabel={t("landing.motionStackSeeMore")}
        seeMoreHref={`${WEB_ROUTES.DEMO_GUIDE}#${GUIDE_SECTION_ID.getStarted}`}
      />

      {/* ── Randomized text effect (UI Layouts) ─────────────── */}
      <section className="bg-background px-6 py-16">
        <AppearIn className="flex justify-center">
          <RandomizedTextEffect text={t("landing.motionRandomizedText")}>
            <Typography variant="body1" as="span" className="font-mono tracking-wide">
              {" "}
            </Typography>
          </RandomizedTextEffect>
        </AppearIn>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="bg-muted/30">
        <AppearIn className="mb-12 px-6 text-center">
          <Typography variant="h2" className="text-3xl font-bold md:text-4xl">
            {t("landing.statsTitle")}
          </Typography>
        </AppearIn>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-10 px-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <AppearIn key={stat.label} delay={i * 100}>
              <StatCard value={stat.value} suffix={stat.suffix} label={stat.label} />
            </AppearIn>
          ))}
        </div>
      </section>

      {/* ── Spotlight Feature Cards ─────────────────────────── */}
      <section className="px-6 py-20">
        <AppearIn className="mb-12 text-center">
          <Typography variant="h2" className="text-3xl font-bold md:text-4xl">
            {t("landing.featureTitle")}
          </Typography>
        </AppearIn>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <AppearIn key={feature.title} delay={i * 100}>
              <SpotlightCard className="h-full rounded-xl border p-6">
                <Typography variant="h3" className="mb-3 text-4xl">
                  {feature.icon}
                </Typography>
                <Typography variant="h6" className="mb-2 font-semibold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {feature.desc}
                </Typography>
              </SpotlightCard>
            </AppearIn>
          ))}
        </div>
      </section>

      <LandingPricingSection />

      <FaqSection
        title={t("landing.faqTitle")}
        subtitle={t("landing.faqSubtitle")}
        items={faqItems}
        includeJsonLd
        headingId="demo-landing-faq-heading"
        className="bg-muted/15"
      />

      {/* ── CTA Banner ──────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 px-6 py-24">
        <AppearIn className="mx-auto max-w-2xl space-y-6 text-center">
          <Typography variant="h2" className="text-3xl font-bold md:text-4xl">
            {t("landing.ctaTitle")}
          </Typography>
          <Typography variant="body1" className="text-muted-foreground text-lg">
            {t("landing.ctaSubtitle")}
          </Typography>
          <Button size="lg" onClick={() => openLinkInNewTab(GITHUB_URL)}>
            {t("landing.ctaButton")}
          </Button>
        </AppearIn>
      </section>
    </div>
  );
}
