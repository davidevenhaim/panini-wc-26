/**
 * Ready-to-use formatters for formatted input fields (currency, percentages, etc.)
 */

export type FormatterFn = {
  /** Format value for display in the input */
  format: (value: string) => string;
  /** Parse display value back to raw value for form state */
  parse: (displayValue: string) => string;
};

/** US Dollar: $1,234.56 */
const dollarFormatter: FormatterFn = {
  format: (value) => {
    const num = value.replace(/[^0-9.]/g, "");
    if (!num) return "";
    const parts = num.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `$${parts[0]}.${parts[1].slice(0, 2)}` : `$${parts[0]}`;
  },
  parse: (displayValue) => displayValue.replace(/[^0-9.]/g, "").replace(/,/g, ""),
};

/** Euro: €1.234,56 (European format) */
const euroFormatter: FormatterFn = {
  format: (value) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const [intPart, decPart] = cleaned.split(".");
    const num = intPart ?? "";
    if (!num) return "";
    const formatted = num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const dec = decPart?.slice(0, 2) ?? "";
    return dec ? `€${formatted},${dec}` : `€${formatted}`;
  },
  parse: (displayValue) => {
    const cleaned = displayValue.replace(/[^0-9,]/g, "");
    const [intPart, decPart] = cleaned.split(",");
    const int = (intPart ?? "").replace(/\./g, "");
    const dec = (decPart ?? "").slice(0, 2);
    return dec ? `${int}.${dec}` : int;
  },
};

/** Percentage: 12.5% */
const percentFormatter: FormatterFn = {
  format: (value) => {
    const num = value.replace(/[^0-9.]/g, "");
    if (!num) return "";
    return `${num}%`;
  },
  parse: (displayValue) => displayValue.replace(/[^0-9.]/g, ""),
};

/** Phone (US): (123) 456-7890 */
const phoneFormatter: FormatterFn = {
  format: (value) => {
    const num = value.replace(/\D/g, "").slice(0, 10);
    if (num.length <= 3) return num ? `(${num}` : "";
    if (num.length <= 6) return `(${num.slice(0, 3)}) ${num.slice(3)}`;
    return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6)}`;
  },
  parse: (displayValue) => displayValue.replace(/\D/g, ""),
};

/** SSN: 123-45-6789 */
const ssnFormatter: FormatterFn = {
  format: (value) => {
    const num = value.replace(/\D/g, "").slice(0, 9);
    if (num.length <= 3) return num;
    if (num.length <= 5) return `${num.slice(0, 3)}-${num.slice(3)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 5)}-${num.slice(5)}`;
  },
  parse: (displayValue) => displayValue.replace(/\D/g, ""),
};

/** Credit card: 1234 5678 9012 3456 */
const creditCardFormatter: FormatterFn = {
  format: (value) => {
    const num = value.replace(/\D/g, "").slice(0, 16);
    return num.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  },
  parse: (displayValue) => displayValue.replace(/\D/g, ""),
};

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
const BYTE_UNIT_MULTIPLIERS: Record<string, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
};
const BYTE_UNIT_SUFFIX = /\s*(TB|GB|MB|KB|B)\s*$/i;

export const formatBytes: FormatterFn = {
  format: (value) => {
    const decimals = 1;
    const bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes === 0) return "0 B";

    const absBytes = Math.abs(bytes);
    const base = 1024;
    const unitIndex = Math.min(
      Math.floor(Math.log(absBytes) / Math.log(base)),
      BYTE_UNITS.length - 1
    );
    const output = bytes / Math.pow(base, unitIndex);

    return `${output.toFixed(decimals).replace(/\.0+$/, "")} ${BYTE_UNITS[unitIndex]}`;
  },
  parse: (displayValue) => {
    const trimmed = displayValue.trim();
    if (!trimmed) return "";

    const withoutCommas = trimmed.replace(/,/g, "");

    // Raw digits → treat as bytes (user mid-typing)
    if (/^[\d.]+$/.test(withoutCommas)) {
      const num = parseFloat(withoutCommas);
      return Number.isFinite(num) ? String(Math.round(num)) : "";
    }

    // Unit at end: "10 KB", "1.5 MB"
    const suffixMatch = withoutCommas.match(BYTE_UNIT_SUFFIX);
    if (suffixMatch) {
      const unitKey = suffixMatch[1].toUpperCase();
      const numericPart = withoutCommas.slice(0, suffixMatch.index).trim();
      const num = parseFloat(numericPart.replace(/[^\d.]/g, ""));
      if (!Number.isFinite(num)) return "";
      return String(Math.round(num * (BYTE_UNIT_MULTIPLIERS[unitKey] ?? 1)));
    }

    // Digit(s) typed after the unit: "1 KB0" → "10 KB", "1.5 KB0" → "10 KB"
    // Strip fractional part of the lead so "1.5"+"0" = "10", not "1.50" (digit absorbed)
    const midMatch = withoutCommas.match(/^([\d.]+)\s*(TB|GB|MB|KB|B)\s*(\d+)$/i);
    if (midMatch) {
      const unitKey = midMatch[2].toUpperCase();
      const leadInt = midMatch[1].split(".")[0];
      const num = parseFloat(leadInt + midMatch[3]);
      if (!Number.isFinite(num)) return "";
      return String(Math.round(num * (BYTE_UNIT_MULTIPLIERS[unitKey] ?? 1)));
    }

    // Fallback: extract digits, treat as raw bytes
    const num = parseFloat(withoutCommas.replace(/[^\d.]/g, ""));
    return Number.isFinite(num) ? String(Math.round(num)) : "";
  },
};

/** Integer with commas: 1,234 */
const integerFormatter: FormatterFn = {
  format: (value) => {
    const num = value.replace(/[^0-9]/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  parse: (displayValue) => displayValue.replace(/[^0-9]/g, ""),
};

export const inputFormatter = {
  dollar: dollarFormatter,
  euro: euroFormatter,
  percent: percentFormatter,
  phone: phoneFormatter,
  ssn: ssnFormatter,
  creditCard: creditCardFormatter,
  bytes: formatBytes,
  integer: integerFormatter,
};
