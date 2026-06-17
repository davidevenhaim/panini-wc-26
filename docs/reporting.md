# Album data reports

Community "Report a mistake" workflow. Users flag wrong album, section or
sticker data; the report sits in Supabase for maintainers to review.

## Surfaces

The `ReportButton` is currently mounted in:

- `src/features/album/album-page.tsx` — WC26 album footer.
- `src/features/album/generic/generic-album-page.tsx` — all `flat-sections`
  / `team-grid` albums.
- `src/features/album/generic/section-dialog.tsx` — per section/team.
- `src/features/album/generic/album-missing-view.tsx` and
  `album-duplicates-view.tsx` — list views.
- `src/features/album/album-router.tsx` — metadata-only placeholder pages.

Every surface auto-populates `ReportContext` so the form shows
`Album / Section / Sticker` without asking the user.

## Data model

Migration `supabase/migrations/0005_album_data_reports.sql` adds the
`album_data_reports` table plus two enums:

- `album_data_issue_type`
- `album_data_report_status`

Columns enforce text-length and URL format at the DB level. The TypeScript
schema in `src/features/data-reports/types.ts` mirrors those constraints
with Zod for client-side and server-side validation.

## RLS

- `users insert own report` — `auth.uid() = user_id`.
- `users read own report` — same predicate; users cannot list other
  people's reports.
- No update/delete policies — admin workflows must use a service-role
  client from server-only code.

## Anonymous submissions

The current implementation requires authentication. RLS denies
`auth.uid() IS NULL` inserts. Two reasonable paths to add anonymous
submissions later:

1. Server action with hCaptcha/Turnstile that uses a service-role client.
2. A separate "edge" endpoint that accepts unauthenticated reports with
   per-IP rate limiting and writes via a service role.

Both keep the service-role key on the server only — never expose it to
the browser.

## Rate limiting

No app-level rate limiter yet. Practical options:

- Add a per-user check via a SQL trigger that rejects more than N inserts
  per hour.
- Use Supabase Edge Functions with the built-in request-limit middleware.

The DB schema already constrains text length and URL shape, which limits
abuse surface.

## Admin workflow

`listOpenReportsForAlbum` in `src/features/data-reports/insert.ts`
returns open reports for an album. It expects a Supabase client that has
permission to read — pass a service-role client from server code, or wait
for the admin role policy to land.

## Deployment

Apply migrations in order:

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_album.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_public_profile.sql
psql "$DATABASE_URL" -f supabase/migrations/0003_profile_avatar.sql
psql "$DATABASE_URL" -f supabase/migrations/0004_user_stickers_album_id.sql
psql "$DATABASE_URL" -f supabase/migrations/0005_album_data_reports.sql
```

Or via the Supabase dashboard SQL editor — paste each file in order.
