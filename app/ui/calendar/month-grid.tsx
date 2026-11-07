"use client";

import Link from "next/link";
import { ShiftChip } from "@/app/ui/calendar/shift-chip";
import { calendarHref, groupByDate } from "@/lib/calendar";
import { weekdayShort } from "@/lib/time";

import type { CalendarShift } from "@/lib/interfaces";
import type { LocalDate } from "@/lib/types";

const MAX_CHIPS = 3;

interface MonthGridProps {
  basePath: string;
  days: LocalDate[];
  monthPrefix: string; // "YYYY-MM"; days outside it are dimmed
  today: LocalDate;
  shifts: CalendarShift[];
  onDayClick: (date: LocalDate) => void;
  onShiftClick: (shift: CalendarShift) => void;
}

export function MonthGrid({
  basePath,
  days,
  monthPrefix,
  today,
  shifts,
  onDayClick,
  onShiftClick,
}: MonthGridProps) {
  const byDate = groupByDate(shifts);

  return (
    <div className="overflow-hidden rounded border border-gray-200">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-foreground/5 text-center text-xs">
        {days.slice(0, 7).map((day) => (
          <div key={day} className="py-1">
            {weekdayShort(day)}
          </div>
        ))}
      </div>

      <ul className="grid grid-cols-7">
        {days.map((date) => (
          <DayListItem
            key={date}
            date={date}
            byDate={byDate}
            monthPrefix={monthPrefix}
            today={today}
            basePath={basePath}
            onDayClick={onDayClick}
            onShiftClick={onShiftClick}
          />
        ))}
      </ul>
    </div>
  );
}

interface DayListItemProps {
  date: string;
  byDate: Map<string, CalendarShift[]>;
  monthPrefix: string;
  today: string;
  basePath: string;
  onDayClick: (date: string) => void;
  onShiftClick: (shift: CalendarShift) => void;
}

const DayListItem = ({
  date,
  byDate,
  monthPrefix,
  today,
  basePath,
  onDayClick,
  onShiftClick,
}: DayListItemProps) => {
  const dayShifts = byDate.get(date) ?? [];
  const hidden = dayShifts.length - MAX_CHIPS;
  const outside = !date.startsWith(monthPrefix);

  return (
    <li
      key={date}
      className={`relative min-h-24 border-b border-s border-gray-200 p-1 ${outside ? "bg-foreground/5 text-gray-400" : ""}`}
    >
      <button
        type="button"
        aria-label={`הוספת משמרת ב-${date}`}
        onClick={() => onDayClick(date)}
        className="absolute inset-0"
      />
      <div className="pointer-events-none relative flex flex-col gap-0.5">
        <Link
          href={calendarHref(basePath, "day", date)}
          className={`pointer-events-auto self-start rounded-full px-1.5 text-xs ${date === today ? "bg-foreground text-background" : ""}`}
        >
          {Number(date.slice(8))}
        </Link>
        {dayShifts.slice(0, MAX_CHIPS).map((shift) => (
          <ShiftChip key={shift.id} shift={shift} onClick={onShiftClick} />
        ))}
        {hidden > 0 && (
          <Link
            href={calendarHref(basePath, "day", date)}
            className="pointer-events-auto text-xs underline"
          >
            ועוד {hidden}
          </Link>
        )}
      </div>
    </li>
  );
};
