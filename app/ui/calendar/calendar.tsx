"use client";

import { MonthGrid } from "@/app/ui/calendar/month-grid";
import { TimeGrid } from "@/app/ui/calendar/time-grid";
import { visibleDays, type CalendarView } from "@/lib/calendar";
import type { CalendarShift } from "@/lib/interfaces";
import type { LocalDate } from "@/lib/types";

// Reusable display: the admin and (later) worker screens plug in their own click handlers.
export function Calendar({
  basePath,
  view,
  date,
  today,
  shifts,
  onSlotClick,
  onShiftClick,
}: {
  basePath: string;
  view: CalendarView;
  date: LocalDate;
  today: LocalDate;
  shifts: CalendarShift[];
  onSlotClick: (date: LocalDate, startTime?: string) => void;
  onShiftClick: (shift: CalendarShift) => void;
}) {
  const days = visibleDays(view, date);

  if (view === "month") {
    return (
      <MonthGrid
        basePath={basePath}
        days={days}
        monthPrefix={date.slice(0, 7)}
        today={today}
        shifts={shifts}
        onDayClick={onSlotClick}
        onShiftClick={onShiftClick}
      />
    );
  }

  return (
    <TimeGrid
      basePath={basePath}
      days={days}
      today={today}
      shifts={shifts}
      onSlotClick={onSlotClick}
      onShiftClick={onShiftClick}
    />
  );
}
