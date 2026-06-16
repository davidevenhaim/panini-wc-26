-- Panini WC 2026 — multi-user collection + share links
-- Paste this into the Supabase SQL editor and run once.

-- ─── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null check (username ~ '^[a-z0-9_-]{3,20}$'),
  display_name  text,
  bio           text,
  contact_method text check (
    contact_method in ('whatsapp', 'telegram', 'email', 'phone', 'instagram', 'none')
  ),
  contact_value text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

alter table public.profiles enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public"
  on public.profiles for select
  using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── user_stickers ───────────────────────────────────────────────────────────
create table if not exists public.user_stickers (
  user_id    uuid not null references auth.users(id) on delete cascade,
  code       text not null,
  quantity   integer not null check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, code)
);

create index if not exists user_stickers_user_id_idx on public.user_stickers (user_id);

alter table public.user_stickers enable row level security;

drop policy if exists "stickers are public" on public.user_stickers;
create policy "stickers are public"
  on public.user_stickers for select
  using (true);

drop policy if exists "users write own stickers" on public.user_stickers;
create policy "users write own stickers"
  on public.user_stickers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── updated_at trigger ──────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists user_stickers_set_updated_at on public.user_stickers;
create trigger user_stickers_set_updated_at
  before update on public.user_stickers
  for each row execute function public.set_updated_at();
