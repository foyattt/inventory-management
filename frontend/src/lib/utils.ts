// frontend/src/lib/utils.ts

/**
 * Simple className merger (no external deps required).
 * Accepts strings, numbers, falsy values, and nested arrays.
 */
export function cn(...inputs: Array<string | number | false | null | undefined | (string | number | false | null | undefined)[]>): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    }
  }

  return classes.join(" ");
}

/**
 * Format a date string or Date object for display.
 */
export function formatDate(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, options);
}