"use client";

import * as React from "react";
import type { ReactNode } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useDirection } from "@/components/app/direction-provider";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  /** Fill the container — pass an <img className="h-full w-full object-cover" /> or a styled div */
  visual: ReactNode;
  title: string;
  description: string;
  actionText: string;
  onClick?: () => void;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  /** Auto-advance interval in ms. Pass 0 to disable. Default: 5000 */
  interval?: number;
  className?: string;
};

export function HeroCarousel({ slides, interval = 5000, className }: HeroCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const dir = useDirection();

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
      setProgress(0);
    };
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Auto-advance with smooth progress fill
  React.useEffect(() => {
    if (!api || interval <= 0) return;

    setProgress(0);
    const start = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / interval) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timerRef.current!);
        api.scrollNext();
      }
    }, 30);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [api, current, interval]);

  return (
    <div className={cn("w-full", className)}>
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "center", direction: dir }}
        className="w-full"
      >
        <CarouselContent className="items-stretch">
          {slides.map((slide, i) => {
            const isActive = i === current;
            return (
              <CarouselItem key={i} className="basis-[88%] ps-2 md:basis-[82%]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl md:aspect-[16/9]">
                  {/* Background visual — should fill the container */}
                  <div className="absolute inset-0 [&>*]:h-full [&>*]:w-full">{slide.visual}</div>

                  {/* Gradient overlays for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent rtl:bg-gradient-to-l" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Dim overlay — fades in/out independently, never affects Embla scroll */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-black/40 transition-opacity duration-500",
                      isActive ? "opacity-0" : "opacity-100"
                    )}
                  />

                  {/* Content — only visible on active slide */}
                  <div
                    className={cn(
                      "absolute inset-0 flex flex-col justify-end p-5 transition-opacity duration-500 md:p-10",
                      isActive ? "opacity-100" : "pointer-events-none opacity-0"
                    )}
                  >
                    <div className="me-auto w-full max-w-[60%] min-w-0">
                      <Typography
                        variant="h2"
                        className="mb-4 text-xl leading-tight font-extrabold text-white md:text-3xl lg:text-4xl"
                      >
                        {slide.title}
                      </Typography>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          size="sm"
                          className="shrink-0 rounded-full bg-white text-black hover:bg-white/90"
                          onClick={slide.onClick}
                        >
                          {slide.actionText}
                        </Button>
                        <Typography variant="body2" className="text-sm text-white/75">
                          {slide.description}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Progress bars — one per slide, active fills over the interval */}
      {interval > 0 && (
        <div className="mt-3 flex gap-1.5 px-[6%] md:px-[9%]">
          {slides.map((_, i) => (
            <div key={i} className="bg-foreground/20 h-0.5 flex-1 overflow-hidden rounded-full">
              <div
                className="bg-foreground h-full rounded-full transition-none"
                style={{ width: i === current ? `${progress}%` : "0%" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
