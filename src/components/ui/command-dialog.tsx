"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type CommandDialogItem = {
  id: string;
  label: string;
  shortcut?: string;
  group?: string;
  onSelect?: () => void;
};

export type CommandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  items: CommandDialogItem[];
  emptyMessage?: string;
  className?: string;
};

export function CommandDialog({
  open,
  onOpenChange,
  title,
  description,
  items,
  emptyMessage,
  className,
}: CommandDialogProps) {
  const t = useTranslations();
  const resolvedTitle = title ?? t("commandPalette.title");
  const resolvedDescription = description ?? t("commandPalette.description");
  const resolvedEmpty = emptyMessage ?? t("commandPalette.empty");

  const groups = React.useMemo(() => {
    const map = new Map<string, CommandDialogItem[]>();
    for (const item of items) {
      const key = item.group ?? t("commandPalette.defaultGroup");
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [items, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("overflow-hidden p-0 sm:max-w-lg", className)} showCloseButton>
        <DialogHeader className="sr-only">
          <DialogTitle>{resolvedTitle}</DialogTitle>
          <DialogDescription>{resolvedDescription}</DialogDescription>
        </DialogHeader>
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder={t("commandPalette.searchPlaceholder")} />
          <CommandList>
            <CommandEmpty>{resolvedEmpty}</CommandEmpty>
            {groups.map(([group, groupItems], index) => (
              <React.Fragment key={group}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup heading={group}>
                  {groupItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.label}
                      onSelect={() => {
                        item.onSelect?.();
                        onOpenChange(false);
                      }}
                    >
                      {item.label}
                      {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
