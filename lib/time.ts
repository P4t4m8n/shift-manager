import { TIMEZONE } from "@/lib/config";
import type { LocalDate } from "@/lib/types";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Dates are plain "YYYY-MM-DD" strings; arithmetic goes through UTC so the machine's timezone can't shift a day.
function toUtc(date: LocalDate) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUtc(date: Date): LocalDate {
  return date.toISOString().slice(0, 10);
}

export function isValidDate(value: string): boolean {
  return DATE_REGEX.test(value) && fromUtc(toUtc(value)) === value;
}

export function todayInIsrael(): LocalDate {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(
    new Date(),
  );
}

export function addDays(date: LocalDate, days: number): LocalDate {
  const result = toUtc(date);
  result.setUTCDate(result.getUTCDate() + days);
  return fromUtc(result);
}

// Weeks start on Sunday.
export function startOfWeek(date: LocalDate): LocalDate {
  return addDays(date, -toUtc(date).getUTCDay());
}

export function weekDays(weekStart: LocalDate): LocalDate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function weekdayName(date: LocalDate): string {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    timeZone: "UTC",
  }).format(toUtc(date));
}

// "2026-11-05" -> "05.11"
export function formatDayMonth(date: LocalDate): string {
  const [, month, day] = date.split("-");
  return `${day}.${month}`;
}

// "2026-11-05" -> "05.11.2026"
export function formatFullDate(date: LocalDate): string {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

export function weekdayShort(date: LocalDate): string {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "short",
    timeZone: "UTC",
  }).format(toUtc(date));
}

export function monthTitle(date: LocalDate): string {
  return new Intl.DateTimeFormat("he-IL", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(toUtc(date));
}

export function startOfMonth(date: LocalDate): LocalDate {
  return `${date.slice(0, 8)}01`;
}

export function daysInMonth(date: LocalDate): number {
  const [year, month] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// Returns the first day of the target month.
export function addMonths(date: LocalDate, months: number): LocalDate {
  const [year, month] = date.split("-").map(Number);
  return fromUtc(new Date(Date.UTC(year, month - 1 + months, 1)));
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
