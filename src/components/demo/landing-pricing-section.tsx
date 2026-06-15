"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { PricingTable, type PricingPlan } from "@/components/ui/pricing-table";
import { Typography } from "@/components/ui/typography";
import { AppearIn } from "@/components/ui/animations/appear-in";

export function LandingPricingSection() {
  const t = useTranslations("demo.landing");

  const plans = React.useMemo<PricingPlan[]>(
    () => [
      {
        id: "starter",
        name: t("pricingStarterName"),
        description: t("pricingStarterDesc"),
        monthlyPrice: t("pricingStarterMonthly"),
        yearlyPrice: t("pricingStarterYearly"),
        features: [t("pricingFeature1"), t("pricingFeature2")],
        ctaLabel: t("pricingCta"),
      },
      {
        id: "pro",
        name: t("pricingProName"),
        description: t("pricingProDesc"),
        monthlyPrice: t("pricingProMonthly"),
        yearlyPrice: t("pricingProYearly"),
        features: [t("pricingFeature1"), t("pricingFeature2"), t("pricingFeature3")],
        highlighted: true,
        ctaLabel: t("pricingCta"),
      },
      {
        id: "team",
        name: t("pricingTeamName"),
        description: t("pricingTeamDesc"),
        monthlyPrice: t("pricingTeamMonthly"),
        yearlyPrice: t("pricingTeamYearly"),
        features: [t("pricingFeature1"), t("pricingFeature2"), t("pricingFeature3")],
        ctaLabel: t("pricingCta"),
      },
    ],
    [t]
  );

  return (
    <section className="px-6 py-20">
      <AppearIn className="mb-10 space-y-2 text-center">
        <Typography variant="h2" className="text-3xl font-bold md:text-4xl">
          {t("pricingTitle")}
        </Typography>
        <Typography variant="body1" color="muted">
          {t("pricingSubtitle")}
        </Typography>
      </AppearIn>
      <AppearIn delay={100}>
        <div className="mx-auto max-w-5xl">
          <PricingTable plans={plans} />
        </div>
      </AppearIn>
    </section>
  );
}
