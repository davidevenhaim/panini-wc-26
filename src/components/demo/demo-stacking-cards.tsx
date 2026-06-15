"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export type DemoStackingCardItem = {
  title: string;
  description: string;
  imageUrl: string;
  color: string;
};

function StackingCard({
  i,
  title,
  description,
  imageUrl,
  color,
  progress,
  range,
  targetScale,
  imageAlt,
  seeMoreLabel,
  seeMoreHref,
}: {
  i: number;
  title: string;
  description: string;
  imageUrl: string;
  color: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
  imageAlt: string;
  seeMoreLabel: string;
  seeMoreHref: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="sticky top-0 flex h-[70vh] min-h-[28rem] items-center justify-center md:h-screen"
    >
      <motion.div
        style={{
          backgroundColor: color,
          scale,
          top: `calc(-5vh + ${i * 25}px)`,
        }}
        className={`relative -top-[25%] flex h-[min(28rem,85vh)] w-[min(90vw,42rem)] origin-top flex-col rounded-md p-3 sm:p-4 lg:p-10`}
      >
        <Typography variant="h6" className="text-center font-semibold text-black">
          {title}
        </Typography>
        <div className="mt-5 flex h-full flex-col gap-6 md:flex-row md:gap-10">
          <div className="relative top-0 w-full md:top-[10%] md:w-[40%]">
            <Typography variant="caption1" className="text-black">
              {description}
            </Typography>
            <Button
              variant="link"
              size="none"
              className="mt-2 h-auto p-0 text-black underline"
              asChild
            >
              <Link href={seeMoreHref}>{seeMoreLabel}</Link>
            </Button>
          </div>

          <div className="relative h-48 w-full overflow-hidden rounded-lg md:h-full md:min-h-0 md:w-[60%]">
            <motion.div className="relative h-full w-full" style={{ scale: imageScale }}>
              <Image
                fill
                src={imageUrl}
                alt={imageAlt}
                sizes="(max-width:768px) 90vw, 420px"
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

type DemoStackingCardsProps = {
  introTitle: string;
  introHint: string;
  cards: DemoStackingCardItem[];
  imageAlt: string;
  seeMoreLabel: string;
  seeMoreHref: string;
};

export function DemoStackingCards({
  cards,
  imageAlt,
  seeMoreLabel,
  seeMoreHref,
}: DemoStackingCardsProps) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={container} className="relative">
      <section className="bg-muted/20">
        {cards.map((project, i) => {
          const targetScale = 1 - (cards.length - i) * 0.05;
          return (
            <StackingCard
              key={`stack-${project.title}`}
              i={i}
              title={project.title}
              description={project.description}
              imageUrl={project.imageUrl}
              color={project.color}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
              imageAlt={imageAlt}
              seeMoreLabel={seeMoreLabel}
              seeMoreHref={seeMoreHref}
            />
          );
        })}
      </section>
    </div>
  );
}
