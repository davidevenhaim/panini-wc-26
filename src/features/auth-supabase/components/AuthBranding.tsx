"use client";

import Image from "next/image";
import { Typography } from "@/components/ui/typography";
import { SITE_METADATA } from "@/constants/site-metadata.constants";

type Props = {
  title: string;
  subtitle: string;
};

export function AuthBranding({ title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="ring-border/40 relative h-20 w-20 overflow-hidden rounded-3xl shadow-lg ring-1">
        <Image
          src={SITE_METADATA.logoPath}
          alt=""
          width={80}
          height={80}
          className="h-full w-full object-contain p-1.5"
          priority
        />
      </div>
      <div className="space-y-1">
        <Typography variant="h4">{title}</Typography>
        <Typography variant="caption2" color="muted">
          {subtitle}
        </Typography>
      </div>
    </div>
  );
}
