/* eslint-disable @typescript-eslint/no-explicit-any */
// ----------------------------------------------------------------------

export function isEqual(a: any, b: any): boolean {
  if (a === null || a === undefined || b === null || b === undefined) {
    return a === b;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a === "string" || typeof a === "number" || typeof a === "boolean") {
    return a === b;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      if (!b.has(key) || !isEqual(val, b.get(key))) return false;
    }
    return true;
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const val of a) {
      if (!b.has(val)) return false;
    }
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    return a.every((item, index) => isEqual(item, b[index]));
  }

  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a!);
    const keysB = Object.keys(b!);

    if (keysA.length !== keysB.length) {
      return false;
    }

    return keysA.every((key) => isEqual(a[key], b[key]));
  }

  return false;
}

// ----------------------------------------------------------------------

function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export const merge = (target: any, ...sources: any[]): any => {
  if (!sources.length) return target;

  const source = sources.shift();

  for (const key in source) {
    if (isObject(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      merge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }

  return merge(target, ...sources);
};

export function getRandomPastelColor(): string {
  const makePastel = () => Math.floor(Math.random() * 127 + 127); // Generates numbers between 127 and 255 for a pastel effect

  const r = makePastel().toString(16).padStart(2, "0");
  const g = makePastel().toString(16).padStart(2, "0");
  const b = makePastel().toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}

/** Promise-based delay. */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Deep clone any serializable value using structuredClone. */
export function deepClone<T>(value: T): T {
  return structuredClone(value);
}

export function getIsImageValid(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export function openLinkInNewTab(url: string): void {
  window.open(url, "_blank");
}
