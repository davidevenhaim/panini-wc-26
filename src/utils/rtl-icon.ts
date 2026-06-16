const RTL_FLIP_EXCLUDED = new Set(["chevron-down", "chevron-up", "chevrons-up-down"]);

const RTL_FLIP_EXACT = new Set([
  "log-in",
  "log-out",
  "external-link",
  "reply",
  "forward",
  "undo",
  "redo",
]);

function iconName(icon: string): string {
  const colon = icon.indexOf(":");
  return colon === -1 ? icon : icon.slice(colon + 1);
}

/** Icons with horizontal directionality should mirror in RTL layouts. */
export function shouldFlipRtlIcon(icon: string): boolean {
  const name = iconName(icon);

  if (RTL_FLIP_EXCLUDED.has(name)) return false;
  if (RTL_FLIP_EXACT.has(name)) return true;

  if (/(?:^|-)(?:left|right)$/.test(name)) return true;
  if (/corner-(?:up|down)-(?:left|right)/.test(name)) return true;
  if (/arrow-(?:up|down)-(?:left|right)/.test(name)) return true;

  return false;
}
