import { readFileSync } from "node:fs";
import { join } from "node:path";

let cachedLogoDataUrl: string | null = null;

/**
 * Read the public logo from disk and return it as a base64 data URL.
 * Used inside `next/og` ImageResponse so the OG image renders without
 * relying on `NEXT_PUBLIC_SITE_URL` resolving correctly in production.
 *
 * NOTE: only works in the `nodejs` runtime (the default). The opengraph
 * routes must export `runtime = "nodejs"` (or omit `runtime` entirely).
 */
export function getLogoDataUrl(): string {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;
  try {
    const filePath = join(process.cwd(), "public", "logo.png");
    const buffer = readFileSync(filePath);
    cachedLogoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
    return cachedLogoDataUrl;
  } catch {
    return "";
  }
}
