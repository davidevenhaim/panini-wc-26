# Adding an Album

This project's collection engine is generic — any album that fits the
schema in `src/collections/schema.ts` can be tracked. This guide explains
how to add a new album end-to-end.

## 1. Decide the data status

Every album declares one of three `dataStatus` values:

| Status              | When to use                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `verified-complete` | The full checklist is verified from at least one cited source. Album required-item count must match `totalItems`.                |
| `verified-partial`  | Some items are verified, but the checklist is incomplete. The UI tracks only the verified items and shows a partial-data notice. |
| `metadata-only`     | No verified checklist yet. The album appears in the library so users can come back later; it cannot contain any items.           |

**Do not invent items.** If you cannot cite a source, leave the album as
`metadata-only` until verifiable.

## 2. Prepare the CSV checklist

Copy `examples/album-checklist.example.csv` and fill in your data. The
header row is required and the columns are documented in
`scripts/import-checklist.mjs`. The CSV is the editable canonical form —
the JSON output is generated.

## 3. Prepare album metadata

Copy `examples/album-meta.example.json` and edit:

- `id` and `slug` — must be unique within the catalog.
- `familyId` — `world-cup` or `israel` (add new families in
  `src/collections/catalog.ts` if needed).
- `title.en`, `title.he` — at least one is required.
- `season`, `year`, `publisher`, `country` — optional but useful.
- `itemType` — `STICKER`, `CARD`, or `MIXED`.
- `dataStatus` — see step 1.
- `layout` — `flat-sections` is the generic Israeli-style renderer.
  `world-cup-grouped` is the bespoke WC layout. `metadata-only` for
  placeholder.
- `theme.primary`, `theme.accent`, `theme.direction` (`rtl` / `ltr`).
- `sources` and `verification` for verified albums.

## 4. Run the importer

```bash
pnpm albums:import path/to/checklist.csv \
  --meta path/to/album-meta.json \
  --out src/data/<family>/<slug>.json
```

Inspect the JSON output. Cross-check counts against your source.

## 5. Register the album

Import the JSON into a `.ts` module under `src/data/<family>/` and add it
to the catalog (`src/collections/catalog.ts`). The validator runs on
every load — broken albums are dropped with a console error rather than
crashing the app.

```ts
import myAlbum from "./my-album.json";
import type { Album } from "@/collections/schema";

export const MY_ALBUM = myAlbum as Album;
```

## 6. Validate

```bash
pnpm albums:validate
```

This runs the catalog test suite and asserts there are no load
failures, no duplicate codes, and the per-album invariants hold
(metadata-only contains no items, verified-complete has sources,
required-count matches `totalItems`).

## 7. Translations + UX

The renderer reads bilingual `LocalizedText` fields. Add any new
section titles to your JSON in both `en` and `he` when applicable.
User-facing strings inside the renderer live under `albumLists`,
`album.stats`, and `library` keys in `messages/{en,he,ar,es}.json`.
