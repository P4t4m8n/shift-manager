import type { CalendarBlock, CalendarEvent, CalendarShift } from "@/lib/interfaces";
import {
  addDays,
  addMonths,
  daysInMonth,
  isValidDate,
  startOfMonth,
  startOfWeek,
  todayInIsrael,
  toMinutes,
  weekDays,
} from "@/lib/time";
import type { LocalDate } from "@/lib/types";
import type { CalendarView } from "./types/calendar.type";
import { CALENDAR_VIEWS, MINUTES_IN_DAY } from "./consts/calendar.const";

export function parseView(value: unknown): CalendarView {
  return CALENDAR_VIEWS.find((view) => view === value) ?? "month";
}

export function parseDate(value: unknown): LocalDate {
  return typeof value === "string" && isValidDate(value)
    ? value
    : todayInIsrael();
}

// Every day shown on screen (a month view includes the leading/trailing days of neighbouring months).
export function visibleDays(view: CalendarView, date: LocalDate): LocalDate[] {
  if (view === "day") return [date];
  if (view === "week") return weekDays(startOfWeek(date));

  const first = startOfMonth(date);
  const last = addDays(first, daysInMonth(first) - 1);
  const gridEnd = addDays(startOfWeek(last), 6);
  const days: LocalDate[] = [];
  for (let day = startOfWeek(first); day <= gridEnd; day = addDays(day, 1)) {
    days.push(day);
  }
  return days;
}

export function stepDate(
  view: CalendarView,
  date: LocalDate,
  direction: 1 | -1,
): LocalDate {
  if (view === "day") return addDays(date, direction);
  if (view === "week") return addDays(date, 7 * direction);
  return addMonths(date, direction);
}

export function calendarHref(
  basePath: string,
  view: CalendarView,
  date: LocalDate,
) {
  return `${basePath}?view=${view}&date=${date}`;
}

export function groupByDate(shifts: CalendarShift[]) {
  const map = new Map<LocalDate, CalendarShift[]>();
  for (const shift of shifts) {
    const list = map.get(shift.date) ?? [];
    list.push(shift);
    map.set(shift.date, list);
  }
  for (const list of map.values()) {
    list.sort(
      (a, b) =>
        a.startTime.localeCompare(b.startTime) ||
        a.endTime.localeCompare(b.endTime),
    );
  }
  return map;
}

export function groupEventsByDate(events: CalendarEvent[]) {
  const map = new Map<LocalDate, CalendarEvent[]>();
  for (const event of events) {
    const list = map.get(event.date) ?? [];
    list.push(event);
    map.set(event.date, list);
  }
  // Events without a time come first.
  for (const list of map.values()) {
    list.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
  }
  return map;
}

export interface BlockSegment {
  block: CalendarBlock;
  startMinute: number;
  endMinute: number;
}

// The part of each block that falls on `date` (blocks can span several days).
export function blockSegments(
  blocks: CalendarBlock[],
  date: LocalDate,
): BlockSegment[] {
  const segments: BlockSegment[] = [];
  for (const block of blocks) {
    const startDate = block.startAt.slice(0, 10);
    const endDate = block.endAt.slice(0, 10);
    if (date < startDate || date > endDate) continue;

    const startMinute =
      date === startDate ? toMinutes(block.startAt.slice(11)) : 0;
    const endMinute =
      date === endDate ? toMinutes(block.endAt.slice(11)) : MINUTES_IN_DAY;
    if (endMinute > startMinute) segments.push({ block, startMinute, endMinute });
  }
  return segments.sort((a, b) => a.startMinute - b.startMinute);
}

export function coversWholeDay(segments: BlockSegment[]): boolean {
  return segments.some(
    (segment) => segment.startMinute === 0 && segment.endMinute === MINUTES_IN_DAY,
  );
}

// Hours shown in the week/day grid: at least 08:00-18:00, widened to fit every shift.
export function hourRange(shifts: CalendarShift[]) {
  let startHour = 8;
  let endHour = 18;
  for (const shift of shifts) {
    startHour = Math.min(
      startHour,
      Math.floor(toMinutes(shift.startTime) / 60),
    );
    endHour = Math.max(endHour, Math.ceil(toMinutes(shift.endTime) / 60));
  }
  return { startHour, endHour };
}

export interface PositionedShift {
  shift: CalendarShift;
  lane: number; // column index inside a group of overlapping shifts
  lanes: number; // number of columns in that group
}

// Places overlapping shifts side by side instead of on top of each other.
export function layoutDay(shifts: CalendarShift[]): PositionedShift[] {
  const sorted = [...shifts].sort(
    (a, b) =>
      a.startTime.localeCompare(b.startTime) ||
      a.endTime.localeCompare(b.endTime),
  );
  const result: PositionedShift[] = [];
  let group: { shift: CalendarShift; lane: number }[] = [];
  let laneEnds: number[] = [];
  let groupEnd = 0;

  const flush = () => {
    const lanes = laneEnds.length;
    for (const placed of group) result.push({ ...placed, lanes });
    group = [];
    laneEnds = [];
  };

  for (const shift of sorted) {
    const start = toMinutes(shift.startTime);
    const end = toMinutes(shift.endTime);
    if (group.length > 0 && start >= groupEnd) flush();

    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    group.push({ shift, lane });
    groupEnd = group.length === 1 ? end : Math.max(groupEnd, end);
  }
  flush();
  return result;
}
