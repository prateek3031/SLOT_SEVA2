import { format } from "date-fns";

export const inr = (n: number): string =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)}`;

// HH:MM -> "10:00 AM" (24h-free display for slot chips)
export function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}

// Local-safe ISO date parse: "2026-02-08" -> Date at local midnight (no UTC shift)
export function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const fmtDate = (iso: string): string => format(parseDay(iso), "EEE, dd MMM yyyy");

// Day-strip label relative to the SERVER-anchored today passed in
export function dayLabel(iso: string, today: string): string {
  if (iso === today) return "TODAY";
  const next = new Date(parseDay(today).getTime() + 86_400_000);
  if (format(parseDay(iso), "yyyy-MM-dd") === format(next, "yyyy-MM-dd")) return "TMRW";
  return format(parseDay(iso), "EEE").toUpperCase();
}
