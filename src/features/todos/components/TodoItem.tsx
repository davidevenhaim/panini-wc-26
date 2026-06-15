"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/typography";
import Iconify from "@/components/ui/iconify";
import { toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Todo } from "../types/todo.types";
import { deleteTodoAction, toggleTodoAction } from "../actions";

interface Props {
  todo: Todo;
}

export function TodoItem({ todo }: Props) {
  const t = useTranslations("todos");
  const [pending, start] = useTransition();

  const handleToggle = (checked: boolean) => {
    start(async () => {
      const result = await toggleTodoAction(todo.id, checked);
      if (result?.error) toastError(t("updateFailed"), result.error);
    });
  };

  const handleDelete = () => {
    start(async () => {
      const result = await deleteTodoAction(todo.id);
      if (result?.error) toastError(t("deleteFailed"), result.error);
    });
  };

  return (
    <li className="bg-card flex items-center gap-3 rounded-md border p-3">
      <Checkbox
        checked={todo.done}
        onCheckedChange={(v) => handleToggle(Boolean(v))}
        disabled={pending}
      />
      <Typography
        variant="body2"
        className={cn("flex-1", todo.done && "text-muted-foreground line-through")}
      >
        {todo.text}
      </Typography>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={pending}
        aria-label={t("delete")}
      >
        <Iconify icon="lucide:trash-2" className="size-4" />
      </Button>
    </li>
  );
}
