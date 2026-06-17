# LastSticker checklist import

The platform does not scrape LastSticker. To activate one of the
metadata-only albums you need to dump the public checklist yourself and
feed it to `pnpm albums:import:laststicker`.

```bash
pnpm albums:import:laststicker <input> \
  --meta <album-meta.json> \
  --out <out.json> \
  [--format json|csv]
```

A reconciliation report is written alongside the output file. The script
**warns** when the extracted total does not match the expected
`baseItemCount` from the album meta. Do not mark an album
`verified-complete` until the reconciliation report shows a clean match.

## Accepted input shapes

### JSON

```json
{
  "items": [
    {
      "code": "FWC1",
      "displayNumber": "1",
      "sectionId": "intro",
      "sectionTitleEn": "Intro",
      "sectionEntityType": "INTRO",
      "sectionOrder": 1,
      "order": 1,
      "name": "FWC Trophy",
      "category": "INTRO",
      "isRequired": true,
      "availability": "PACK",
      "sourceUrl": "https://www.laststicker.com/cards/panini_fifa_world_cup_2022/"
    },
    {
      "code": "QAT1",
      "displayNumber": "QAT1",
      "sectionId": "qat",
      "sectionTitleEn": "Qatar",
      "sectionTitleHe": "קטאר",
      "sectionEntityType": "NATIONAL_TEAM",
      "sectionOrder": 2,
      "sectionFlag": "🇶🇦",
      "order": 1,
      "playerName": "Saad Al-Sheeb|סעד אל שיב",
      "teamName": "Qatar|קטאר",
      "category": "GOALKEEPER",
      "isRequired": true,
      "availability": "PACK"
    }
  ]
}
```

Bilingual fields accept `english|hebrew` pipe form. `sectionTitleHe`,
`name`, `playerName`, `teamName` may use the same shape.

### CSV

Same columns as the JSON keys, header row required. Empty cells become
`undefined`. Example:

```
code,displayNumber,sectionId,sectionTitleEn,sectionEntityType,sectionOrder,order,name,playerName,teamName,category,isRequired,availability
FWC1,1,intro,Intro,INTRO,1,1,FWC Trophy,,,INTRO,true,PACK
QAT1,QAT1,qat,Qatar,NATIONAL_TEAM,2,1,,Saad Al-Sheeb,Qatar,GOALKEEPER,true,PACK
```

## Companion meta file

`--meta` is a JSON file with the album-level fields the script merges
into the final album record. Example for WC 2022:

```json
{
  "id": "panini-world-cup-2022",
  "slug": "world-cup-2022",
  "familyId": "panini-world-cup",
  "title": { "en": "FIFA World Cup Qatar 2022", "he": "מונדיאל קטאר 2022" },
  "season": "2022",
  "year": 2022,
  "publisher": "Panini",
  "country": "GLOBAL",
  "itemType": "STICKER",
  "dataStatus": "verified-complete",
  "layout": "flat-sections",
  "totalItems": 670,
  "specialCollections": [],
  "theme": {
    "primary": "#7c1d3f",
    "secondary": "#0f766e",
    "accent": "#facc15",
    "direction": "ltr"
  },
  "sources": [
    {
      "label": "LastSticker — Panini FIFA World Cup 2022 (Standard Edition, 670 items)",
      "url": "https://www.laststicker.com/cards/panini_fifa_world_cup_2022/"
    }
  ],
  "editions": [
    {
      "id": "panini-world-cup-2022::international",
      "albumId": "panini-world-cup-2022",
      "market": "INTERNATIONAL",
      "editionName": { "en": "Standard Edition" },
      "baseItemCount": 670,
      "isDefault": true,
      "sources": [
        {
          "label": "LastSticker — Panini FIFA World Cup 2022 (Standard Edition, 670 items)",
          "url": "https://www.laststicker.com/cards/panini_fifa_world_cup_2022/"
        }
      ]
    }
  ]
}
```

## What to exclude from the input

The Standard Edition for stickers excludes:

- Update sets and late additions
- Coca-Cola / McDonald's / regional promotional cards
- Parallel borders and shiny variants without album spaces
- Local bonus pages

For 2010 Adrenalyn XL the base 350-card set excludes:

- Limited Editions
- Promotional / chase cards
- Updates
- Regional alternatives
- Road to World Cup cards

If a row is excluded by the source's own Standard Edition / base-set
labelling, do not include it in the input file.

## Reconciliation step

After the importer succeeds, run:

```bash
pnpm albums:reconcile <out.json>
```

This re-runs the validation and prints a concise report you can paste
into a PR description.
