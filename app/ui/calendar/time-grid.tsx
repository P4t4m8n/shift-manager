"use client";

import Link from "next/link";
import { ShiftChip } from "@/app/ui/calendar/shift-chip";
import {
  calendarHref,
  groupByDate,
  hourRange,
  layoutDay,
} from "@/lib/calendar";
import type { CalendarShift } from "@/lib/interfaces";
import { formatDayMonth, toMinutes, weekdayShort } from "@/lib/time";
import type { LocalDate } from "@/lib/types";

const HOUR_PX = 56;
const MIN_SHIFT_PX = 22;
const LINE_COLOR = "rgb(229 231 235)";

// Used for both the week view (7 columns) and the day view (1 column).
export function TimeGrid({
  basePath,
  days,
  today,
  shifts,
  onSlotClick,
  onShiftClick,
}: {
  basePath: string;
  days: LocalDate[];
  today: LocalDate;
  shifts: CalendarShift[];
  onSlotClick: (date: LocalDate, startTime?: string) => void;
  onShiftClick: (shift: CalendarShift) => void;
}) {
  const byDate = groupByDate(shifts);
  const { startHour, endHour } = hourRange(shifts);
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i,
  );
  const columns = `3rem repeat(${days.length}, minmax(0, 1fr))`;
  const single = days.length === 1;

  return (
    <div className="overflow-hidden rounded border border-gray-200">
      <div
        className="grid border-b border-gray-200 bg-foreground/5 text-center text-xs"
        style={{ gridTemplateColumns: columns }}
      >
        <div />
        {days.map((date) => (
          <div key={date} className="border-s border-gray-200 py-1">
            {single ? (
              <span className="font-bold">
                {weekdayShort(date)} {formatDayMonth(date)}
              </span>
            ) : (
              <Link
                href={calendarHref(basePath, "day", date)}
                className={`inline-block rounded-full px-1.5 ${date === today ? "bg-foreground text-background" : ""}`}
              >
                {weekdayShort(date)} {formatDayMonth(date)}
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: columns }}>
        <div className="relative" style={{ height: hours.length * HOUR_PX }}>
          {hours.map((hour) => (
            <span
              key={hour}
              dir="ltr"
              className="absolute end-1 -translate-y-1/2 text-xs text-gray-500"
              style={{
                top: (hour - startHour) * HOUR_PX,
                display: hour === startHour ? "none" : undefined,
              }}
            >
              {String(hour).padStart(2, "0")}:00
            </span>
          ))}
        </div>

        {days.map((date) => (
          <div
            key={date}
            className="relative border-s border-gray-200"
            style={{
              height: hours.length * HOUR_PX,
              backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${HOUR_PX - 1}px, ${LINE_COLOR} ${HOUR_PX - 1}px, ${LINE_COLOR} ${HOUR_PX}px)`,
            }}
          >
            <button
              type="button"
              aria-label={`הוספת משמרת ב-${date}`}
              className="absolute inset-0"
              onClick={(event) => {
                // detail === 0 means keyboard activation: no pointer position to read.
                if (event.detail === 0) return onSlotClick(date);
                const rect = event.currentTarget.getBoundingClientRect();
                const hour =
                  startHour +
                  Math.min(
                    hours.length - 1,
                    Math.floor((event.clientY - rect.top) / HOUR_PX),
                  );
                onSlotClick(date, `${String(hour).padStart(2, "0")}:00`);
              }}
            />
            {layoutDay(byDate.get(date) ?? []).map(
              ({ shift, lane, lanes }) => {
                const start = toMinutes(shift.startTime) - startHour * 60;
                const length = toMinutes(shift.endTime) - toMinutes(shift.startTime);
                return (
                  <ShiftChip
                    key={shift.id}
                    shift={shift}
                    onClick={onShiftClick}
                    showDetails
                    className="absolute"
                    style={{
                      top: (start / 60) * HOUR_PX,
                      height: Math.max(MIN_SHIFT_PX, (length / 60) * HOUR_PX - 2),
                      insetInlineStart: `${(lane / lanes) * 100}%`,
                      width: `${100 / lanes}%`,
                    }}
                  />
                );
              },
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
