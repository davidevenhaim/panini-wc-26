-- Multi-album support — adds album_id to user_stickers and changes the primary
-- key to (user_id, album_id, code). Existing rows are backfilled to the
-- legacy WC26 album. Idempotent: safe to run more than once.

-- 1. Add the column with a temporary default so backfill is automatic.
alter table public.user_stickers
  add column if not exists album_id text not null default 'panini-world-cup-2026';

-- 2. Drop the default — clients must now supply album_id explicitly.
alter table public.user_stickers
  alter column album_id drop default;

-- 3. Replace the primary key.
do $$
declare
  pk_name text;
begin
  select conname into pk_name
  from pg_constraint
  where conrelid = 'public.user_stickers'::regclass
    and contype = 'p';
  if pk_name is not null then
    execute format('alter table public.user_stickers drop constraint %I', pk_name);
  end if;
end $$;

alter table public.user_stickers
  add constraint user_stickers_pkey primary key (user_id, album_id, code);

-- 4. Helpful index for per-album queries.
create index if not exists user_stickers_album_idx
  on public.user_stickers (user_id, album_id);

-- 5. RLS policies stay (auth.uid() = user_id); no change required.
