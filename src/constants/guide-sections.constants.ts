/**
 * DOM ids for deep-linking into the demo product guide (`/demo/guide#…`).
 * Use with `WEB_ROUTES.DEMO_GUIDE` (e.g. `${WEB_ROUTES.DEMO_GUIDE}#get_started`).
 */
export const GUIDE_SECTION_ID = {
  getStarted: "get_started",
  setupChecklist: "setup_checklist",
  troubleshooting: "troubleshooting",
  purpose: "purpose",
  whenToUse: "when_to_use",
  goodFit: "good_fit",
  lessSuitable: "less_suitable",
  ignoreAtFirst: "ignore_at_first",
  builtWith: "built_with",
} as const;
