import { field } from "@/lib/form";
import { addDays, startOfWeek } from "@/lib/time";
import type { LocalDate } from "@/lib/types";

export const MAX_REPEAT_WEEKS = 12;
export const REPEAT_WEEKS_ERROR = `מספר השבועות חייב להיות בין 1 ל-${MAX_REPEAT_WEEKS}`;

// Day indexes 0 (Sunday) - 6 (Saturday), unique and sorted.
export function parseWeekDays(formData: FormData): number[] {
  return [...new Set(formData.getAll("days").map(Number))]
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b);
}

// Returns null when the value is not a whole number between 1 and MAX_REPEAT_WEEKS.
export function parseRepeatWeeks(formData: FormData): number | null {
  const weeks = Number(field(formData, "repeatWeeks") || 1);
  return Number.isInteger(weeks) && weeks >= 1 && weeks <= MAX_REPEAT_WEEKS
    ? weeks
    : null;
}

// The chosen weekdays of the week containing weekStart, repeated for N weeks.
export function expandDates(
  weekStart: LocalDate,
  days: number[],
  repeatWeeks: number,
): LocalDate[] {
  const firstDay = startOfWeek(weekStart);
  return Array.from({ length: repeatWeeks }, (_, week) =>
    days.map((day) => addDays(firstDay, week * 7 + day)),
  ).flat();
}
