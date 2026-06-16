-- Public discovery: add an opt-in flag for listing in the public users page.
-- Defaults to true (people who already signed up are visible).

alter table public.profiles
  add column if not exists is_public boolean not null default true;

-- Partial index speeds up the listing query.
create index if not exists profiles_is_public_idx
  on public.profiles (updated_at desc)
  where is_public = true;
