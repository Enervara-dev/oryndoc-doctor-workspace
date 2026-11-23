import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/*
 * Date handling rules (see design-system/oryndoc/MASTER.md §3, §7 "Time rail"):
 * - Calendar dates are plain "YYYY-MM-DD" strings in the clinic's timezone.
 * - "Today" is always computed in the clinic's timezone, never from the browser's
 *   UTC date (toISOString), which shows the wrong day for UTC+ clinics after midnight.
 * - Date-only strings are formatted in UTC so they can never shift by a day.
 */
const LOCALE = "en-GB";

/** Today's calendar date ("YYYY-MM-DD") in the given IANA timezone. */
export function todayInZone(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Adds whole days to a "YYYY-MM-DD" string. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function dateOnly(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`);
}

export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string {
  return dateOnly(iso).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    ...options,
  });
}

/** "Wednesday 19 November 2026" */
export function formatLongDate(iso: string): string {
  return formatDate(iso, { weekday: "long", month: "long" });
}

export function formatShortDate(iso: string): string {
  return formatDate(iso, { year: undefined });
}

/** "10:00 AM" from "HH:mm". */
export function formatTime(time: string): string {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/** Whole days from `today` to `iso` (both calendar dates). */
export function daysUntil(iso: string, today: string = new Date().toISOString().slice(0, 10)): number {
  return Math.round((dateOnly(iso).getTime() - dateOnly(today).getTime()) / 86_400_000);
}

/** "Today", "Tomorrow", "Yesterday", "Thu 20 Nov" (adds the year when it differs). */
export function dayLabel(iso: string, today: string): string {
  const diff = daysUntil(iso, today);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  const sameYear = iso.slice(0, 4) === today.slice(0, 4);
  return formatDate(iso, { weekday: "short", year: sameYear ? undefined : "numeric" });
}

/** Relative wording for due dates: "Today", "In 3 days", "2 days ago", else a short date. */
export function relativeDayLabel(iso: string, today?: string): string {
  const diff = daysUntil(iso, today);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)} days ago`;
  return formatShortDate(iso);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}]/gu, "")[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
