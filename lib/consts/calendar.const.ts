import { CalendarView } from "../types/calendar.type";

export const CALENDAR_VIEWS = ["month", "week", "day"] as const;

export const MINUTES_IN_DAY = 24 * 60;

export const VIEW_LABEL: Record<CalendarView, string> = {
  month: "חודש",
  week: "שבוע",
  day: "יום",
};
