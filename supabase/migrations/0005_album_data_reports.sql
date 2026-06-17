-- Community "Report a mistake" workflow.
--
-- Authenticated users insert reports against album/section/item context.
-- A user can read their own reports.
-- Listing or updating other people's reports is denied by RLS — admin
-- workflows must use the service-role key from server-side code.
--
-- Anonymous (unauthenticated) inserts are NOT enabled by default. Enabling
-- them safely requires either captcha, signed proxy submission or another
-- abuse-control mechanism that isn't part of this migration. See the
-- accompanying notes in docs/reporting.md.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'album_data_issue_type') then
    create type public.album_data_issue_type as enum (
      'WRONG_PLAYER_NAME',
      'WRONG_TEAM',
      'WRONG_STICKER_NUMBER',
      'WRONG_SECTION',
      'MISSING_STICKER',
      'EXTRA_STICKER',
      'WRONG_TOTAL',
      'WRONG_ORDER',
      'WRONG_TRANSLATION',
      'WRONG_SPECIAL_STATUS',
      'OTHER'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'album_data_report_status') then
    create type public.album_data_report_status as enum (
      'OPEN', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'DUPLICATE'
    );
  end if;
end $$;

create table if not exists public.album_data_reports (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  album_id        text not null,
  edition_id      text,
  section_id      text,
  item_code       text,
  issue_type      public.album_data_issue_type not null,
  description     text not null check (length(description) between 4 and 2000),
  suggested_value text check (suggested_value is null or length(suggested_value) <= 500),
  source_url      text check (
    source_url is null
    or source_url ~* '^https?://[^\s]{4,500}$'
  ),
  status          public.album_data_report_status not null default 'OPEN',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists album_data_reports_album_idx
  on public.album_data_reports (album_id, status, created_at desc);
create index if not exists album_data_reports_user_idx
  on public.album_data_reports (user_id, created_at desc);

alter table public.album_data_reports enable row level security;

-- Insert: any authenticated user may insert, must own the row (user_id = auth.uid()).
drop policy if exists "users insert own report" on public.album_data_reports;
create policy "users insert own report"
  on public.album_data_reports for insert
  with check (auth.uid() = user_id);

-- Read: a user can read only their own reports. No public listing.
drop policy if exists "users read own report" on public.album_data_reports;
create policy "users read own report"
  on public.album_data_reports for select
  using (auth.uid() = user_id);

-- Update and delete are not exposed via RLS — they require service-role
-- access. Admin workflows go through server-only code.

drop trigger if exists album_data_reports_set_updated_at on public.album_data_reports;
create trigger album_data_reports_set_updated_at
  before update on public.album_data_reports
  for each row execute function public.set_updated_at();
