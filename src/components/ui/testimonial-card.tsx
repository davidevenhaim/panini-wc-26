"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type TestimonialCardProps = {
  quote: string;
  authorName: string;
  authorRole?: string;
  avatarSrc?: string;
  avatarFallback?: string;
  className?: string;
};

export function TestimonialCard({
  quote,
  authorName,
  authorRole,
  avatarSrc,
  avatarFallback,
  className,
}: TestimonialCardProps) {
  const initials =
    avatarFallback ??
    authorName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="flex h-full flex-col gap-4 pt-6">
        <Iconify icon="lucide:quote" className="text-primary/40 size-8" aria-hidden />
        <Typography
          variant="body2"
          as="blockquote"
          className="text-foreground flex-1 leading-relaxed"
        >
          {quote}
        </Typography>
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            {avatarSrc && <AvatarImage src={avatarSrc} alt="" />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Typography variant="label2" as="p" className="text-foreground">
              {authorName}
            </Typography>
            {authorRole && (
              <Typography variant="caption2" as="p" color="muted">
                {authorRole}
              </Typography>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
