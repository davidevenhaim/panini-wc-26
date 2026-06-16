function parseHex(hex: string): [number, number, number] | null {
  const raw = hex.trim().replace(/^#/, "");
  if (raw.length === 3) {
    return [
      parseInt(raw[0]! + raw[0], 16),
      parseInt(raw[1]! + raw[1], 16),
      parseInt(raw[2]! + raw[2], 16),
    ];
  }
  if (raw.length === 6) {
    return [
      parseInt(raw.slice(0, 2), 16),
      parseInt(raw.slice(2, 4), 16),
      parseInt(raw.slice(4, 6), 16),
    ];
  }
  return null;
}

function luminance(r: number, g: number, b: number): number {
  const transform = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

function mixWhite(r: number, g: number, b: number, amount: number): [number, number, number] {
  return [r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount];
}

/** Lightens dark brand colors so they stay readable on dark surfaces. */
export function readableOnDarkSurface(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;

  const [r, g, b] = rgb;
  if (luminance(r, g, b) >= 0.5) return hex;

  let amount = 0.45;
  let mixed = mixWhite(r, g, b, amount);
  while (luminance(...mixed) < 0.62 && amount < 0.92) {
    amount += 0.08;
    mixed = mixWhite(r, g, b, amount);
  }
  return toHex(...mixed);
}
