"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type PricingPlan = {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
};

export type PricingTableProps = {
  plans: PricingPlan[];
  onSelectPlan?: (planId: string) => void;
  className?: string;
};

export function PricingTable({ plans, onSelectPlan, className }: PricingTableProps) {
  const t = useTranslations();
  const [billing, setBilling] = React.useState<"monthly" | "yearly">("monthly");

  return (
    <div data-slot="pricing-table" className={cn("space-y-6", className)}>
      <div className="flex justify-center">
        <ToggleGroup
          type="single"
          value={billing}
          onValueChange={(value) => value && setBilling(value as "monthly" | "yearly")}
          variant="outline"
        >
          <ToggleGroupItem value="monthly" aria-label={t("pricingTable.monthly")}>
            <Typography variant="label2" as="span">
              {t("pricingTable.monthly")}
            </Typography>
          </ToggleGroupItem>
          <ToggleGroupItem value="yearly" aria-label={t("pricingTable.yearly")}>
            <Typography variant="label2" as="span">
              {t("pricingTable.yearly")}
            </Typography>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col",
                plan.highlighted && "border-primary ring-primary/20 shadow-md ring-1"
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute start-4 -top-2.5" variant="default">
                  {t("pricingTable.popular")}
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                {plan.description && <CardDescription>{plan.description}</CardDescription>}
                <Typography variant="h3" as="p" className="text-foreground pt-2 tabular-nums">
                  {price}
                </Typography>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Iconify
                        icon="lucide:check"
                        className="text-primary mt-0.5 size-4 shrink-0"
                        aria-hidden
                      />
                      <Typography variant="caption1" as="span" color="muted">
                        {feature}
                      </Typography>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  className="mt-auto w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => onSelectPlan?.(plan.id)}
                >
                  {plan.ctaLabel}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
