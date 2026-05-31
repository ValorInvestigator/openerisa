/** Format a 9-digit EIN as XX-XXXXXXX. */
export function formatEin(ein: string): string {
  const d = (ein ?? "").replace(/\D/g, "").padStart(9, "0");
  return `${d.slice(0, 2)}-${d.slice(2)}`;
}

/** Title-case a SHOUTING sponsor/plan name while keeping common acronyms upper. */
const KEEP_UPPER = new Set([
  "LLC", "INC", "PC", "PLLC", "LLP", "LP", "PA", "DBA", "USA", "US", "401K",
  "403B", "457B", "ESOP", "PS", "MD", "DO", "DDS", "DMD", "DPM", "RN", "EIN", "HR",
]);
export function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .split(/\b/)
    .map((tok) => {
      const up = tok.toUpperCase();
      if (KEEP_UPPER.has(up)) return up;
      return tok.replace(/^[a-z]/, (c) => c.toUpperCase());
    })
    .join("");
}

export function num(n: number | null | undefined): string {
  return typeof n === "number" && !Number.isNaN(n) ? n.toLocaleString("en-US") : "—";
}

export const FORM_LABEL: Record<string, string> = {
  "5500": "Form 5500",
  "5500-SF": "Form 5500-SF",
};
