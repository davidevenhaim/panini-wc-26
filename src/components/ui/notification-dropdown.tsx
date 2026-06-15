"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  time?: string;
  unread?: boolean;
};

export type NotificationDropdownProps = {
  items: NotificationItem[];
  onItemClick?: (id: string) => void;
  className?: string;
};

export function NotificationDropdown({ items, onItemClick, className }: NotificationDropdownProps) {
  const t = useTranslations();
  const unreadCount = items.filter((item) => item.unread).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn("relative", className)}
          aria-label={t("notificationDropdown.triggerAria", { count: unreadCount })}
        >
          <Iconify icon="lucide:bell" className="size-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <PopoverHeader className="border-b px-4 py-3">
          <PopoverTitle>{t("notificationDropdown.title")}</PopoverTitle>
        </PopoverHeader>
        <ScrollArea className="max-h-72">
          {items.length === 0 ? (
            <Typography variant="caption1" as="p" color="muted" className="p-4 text-center">
              {t("notificationDropdown.empty")}
            </Typography>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="none"
                    className={cn(
                      "hover:bg-muted/50 h-auto w-full flex-col items-start gap-0.5 rounded-none px-4 py-3 text-start font-normal",
                      item.unread && "bg-primary/5"
                    )}
                    onClick={() => onItemClick?.(item.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Typography variant="label2" as="span" className="text-foreground">
                        {item.title}
                      </Typography>
                      {item.unread && (
                        <span
                          className="bg-primary mt-1.5 size-2 shrink-0 rounded-full"
                          aria-hidden
                        />
                      )}
                    </div>
                    {item.body && (
                      <Typography
                        variant="caption2"
                        as="span"
                        color="muted"
                        className="line-clamp-2"
                      >
                        {item.body}
                      </Typography>
                    )}
                    {item.time && (
                      <Typography variant="caption2" as="time" color="muted" className="mt-0.5">
                        {item.time}
                      </Typography>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
