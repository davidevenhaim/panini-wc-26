"use client";

import * as React from "react";
import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type FaqItem = {
  /** Stable id for accordion value and anchors (e.g. `pricing`) */
  id: string;
  question: string;
  answer: string;
};

export type FaqSectionProps = {
  /** Section heading (e.g. translated “Frequently asked questions”) */
  title?: ReactNode;
  /** Short intro under the title */
  subtitle?: ReactNode;
  items: FaqItem[];
  className?: string;
  /** Container width cap */
  maxWidthClassName?: string;
  /**
   * Accordion behavior: `single` keeps one answer open at a time (recommended
   * for long lists and clearer focus). `multiple` allows several open panels.
   */
  accordionType?: "single" | "multiple";
  /**
   * When true, injects FAQPage JSON-LD (`schema.org`) for eligible rich results.
   * Uses plain text from `items`; keep answers concise and without HTML.
   */
  includeJsonLd?: boolean;
  /** `id` on the heading for `aria-labelledby`; change if multiple FAQs on one page */
  headingId?: string;
};

function faqPageJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * Accessible FAQ block: heading region + accordion (keyboard and screen-reader
 * friendly via Radix). Optional FAQPage structured data for SEO.
 */
export function FaqSection({
  title,
  subtitle,
  items,
  className,
  maxWidthClassName = "max-w-3xl",
  accordionType = "single",
  includeJsonLd = false,
  headingId = "faq-section-heading",
}: FaqSectionProps) {
  const jsonLd = React.useMemo(
    () => (includeJsonLd && items.length > 0 ? faqPageJsonLd(items) : null),
    [includeJsonLd, items]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("px-6 py-16 md:py-24", className)}
      aria-labelledby={title ? headingId : undefined}
    >
      {jsonLd ? (
        <script
          type="application/ld+json"
          // JSON-LD is static, server-trusted item text from callers
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      {(title ?? subtitle) ? (
        <div className={cn("mx-auto mb-10 space-y-3 text-center", maxWidthClassName)}>
          {title ? (
            <Typography id={headingId} variant="h2" className="text-3xl font-bold md:text-4xl">
              {title}
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography variant="body1" className="text-muted-foreground text-lg leading-relaxed">
              {subtitle}
            </Typography>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "border-border/60 bg-card/40 mx-auto rounded-2xl border px-1 py-2 shadow-xs md:px-4 md:py-2",
          maxWidthClassName
        )}
      >
        <Accordion
          type={accordionType}
          className="w-full"
          {...(accordionType === "single" ? { collapsible: true as const } : {})}
        >
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-border/70 px-3 md:px-4">
              <AccordionTrigger className="gap-3 py-5 hover:no-underline">
                <Typography variant="subtitle1" as="span" className="text-start font-semibold">
                  {item.question}
                </Typography>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <Typography variant="body2" color="muted" className="leading-relaxed">
                  {item.answer}
                </Typography>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
