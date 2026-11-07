"use client";

import { MonthGrid } from "@/app/ui/calendar/month-grid";
import { TimeGrid } from "@/app/ui/calendar/time-grid";
import { visibleDays } from "@/lib/calendar";
import { CalendarView } from "@/lib/types/calendar.type";

import type {
  CalendarBlock,
  CalendarEvent,
  CalendarShift,
} from "@/lib/interfaces";
import type { LocalDate } from "@/lib/types";

interface CalendarProps {
  basePath: string;
  view: CalendarView;
  date: LocalDate;
  today: LocalDate;
  shifts: CalendarShift[];
  blocks: CalendarBlock[];
  events: CalendarEvent[];
  onSlotClick?: (date: LocalDate, startTime?: string) => void;
  onShiftClick: (shift: CalendarShift) => void;
  onBlockClick?: (block: CalendarBlock) => void;
  onEventClick?: (event: CalendarEvent) => void;
}
// Reusable display: the admin and (later) worker screens plug in their own click handlers.
export function Calendar({
  basePath,
  view,
  date,
  today,
  shifts,
  blocks,
  events,
  onSlotClick,
  onShiftClick,
  onBlockClick,
  onEventClick,
}: CalendarProps) {
  const days = visibleDays(view, date);

  if (view === "month") {
    return (
      <MonthGrid
        basePath={basePath}
        days={days}
        monthPrefix={date.slice(0, 7)}
        today={today}
        shifts={shifts}
        blocks={blocks}
        events={events}
        onDayClick={onSlotClick}
        onShiftClick={onShiftClick}
        onBlockClick={onBlockClick}
        onEventClick={onEventClick}
      />
    );
  }

  return (
    <TimeGrid
      basePath={basePath}
      days={days}
      today={today}
      shifts={shifts}
      blocks={blocks}
      events={events}
      onSlotClick={onSlotClick}
      onShiftClick={onShiftClick}
      onBlockClick={onBlockClick}
      onEventClick={onEventClick}
    />
  );
}
