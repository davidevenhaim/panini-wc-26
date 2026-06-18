-- Persisted album structures (per-album JSON snapshots).
--
-- The catalog is authored in TypeScript under src/data/world-cup/* and
-- composed in src/collections/catalog.ts. This table mirrors each Album
-- as JSON so non-TS clients (mobile, external tools, admin dashboards)
-- can read the canonical structure without bundling the TS source.
--
-- One row per album:
--   id        — Album.id, e.g. "panini-world-cup-2006"
--   name_key  — Album.slug, e.g. "world-cup-2006" (unique)
--   structure — full Album object serialized to jsonb
--
-- Writes happen only via the service-role key (no insert/update policy
-- is granted), so the catalog stays the source of truth and is published
-- through a server-side sync action.

create table if not exists public.album_structures (
  id         text primary key,
  name_key   text not null,
  structure  jsonb not null,
  version    integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint album_structures_name_key_unique unique (name_key)
);

create index if not exists album_structures_name_key_idx
  on public.album_structures (name_key);

alter table public.album_structures enable row level security;

-- Public read: anyone (anon + authed) may read structures.
drop policy if exists "album structures are public" on public.album_structures;
create policy "album structures are public"
  on public.album_structures for select
  using (true);

-- No insert/update/delete policy — those are gated to the service role,
-- which bypasses RLS. Authoring continues to flow through the catalog.

drop trigger if exists album_structures_set_updated_at on public.album_structures;
create trigger album_structures_set_updated_at
  before update on public.album_structures
  for each row execute function public.set_updated_at();
