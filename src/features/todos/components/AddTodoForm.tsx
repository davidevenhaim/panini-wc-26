"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Form, TextInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { toastError } from "@/lib/toast";
import { addTodoAction } from "../actions";
import { todoSchema, type TodoFormValues } from "../validation/todo.schema";

export function AddTodoForm() {
  const t = useTranslations("todos");
  const [pending, start] = useTransition();

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: { text: "" },
  });

  const onSubmit = (data: TodoFormValues) => {
    start(async () => {
      const fd = new FormData();
      fd.set("text", data.text);
      const result = await addTodoAction(fd);
      if (result?.error) {
        toastError(t("addFailed"), result.error);
        return;
      }
      form.reset();
    });
  };

  return (
    <Form form={form} onSubmit={onSubmit} className="flex w-full gap-2">
      <div className="flex-1">
        <TextInput name="text" placeholderText={t("placeholder")} />
      </div>
      <Button type="submit" loading={pending}>
        {t("add")}
      </Button>
    </Form>
  );
}
