import { getTranslations } from "next-intl/server";
import { Typography } from "@/components/ui/typography";
import Iconify from "@/components/ui/iconify";
import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/lib/app-config";
import type { Todo } from "../types/todo.types";
import { TodoItem } from "./TodoItem";

export async function TodosList() {
  const t = await getTranslations("todos");

  if (!CONFIG.isSupabaseConfigured) {
    return <UnconfiguredNotice />;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Typography variant="caption2" color="destructive">
        {t("loadFailed")}: {error.message}
      </Typography>
    );
  }

  const todos = (data ?? []) as Todo[];

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <Iconify icon="lucide:inbox" className="text-muted-foreground size-8" />
        <Typography variant="caption2" color="muted">
          {t("empty")}
        </Typography>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

async function UnconfiguredNotice() {
  const t = await getTranslations("todos");
  return (
    <div className="flex flex-col items-start gap-3 rounded-md border border-amber-500/40 bg-amber-50 p-4 dark:bg-amber-950/30">
      <div className="flex items-center gap-2">
        <Iconify icon="lucide:info" className="size-4 text-amber-600 dark:text-amber-400" />
        <Typography variant="caption1" className="font-medium">
          {t("unconfiguredTitle")}
        </Typography>
      </div>
      <Typography variant="caption2" color="muted">
        {t("unconfiguredHint")}
      </Typography>
      <pre className="bg-muted w-full overflow-x-auto rounded p-2 text-xs">{`create table todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table todos enable row level security;
create policy "own rows" on todos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`}</pre>
    </div>
  );
}
