"use client";

import Link from "next/link";
import { BlockMarker, EventMarker } from "@/app/ui/calendar/day-markers";
import { ShiftChip } from "@/app/ui/calendar/shift-chip";
import {
  blockSegments,
  calendarHref,
  coversWholeDay,
  groupByDate,
  groupEventsByDate,
} from "@/lib/calendar";
import { weekdayShort } from "@/lib/time";

import type {
  CalendarBlock,
  CalendarEvent,
  CalendarShift,
} from "@/lib/interfaces";
import type { LocalDate } from "@/lib/types";

const MAX_CHIPS = 3;

interface MonthGridProps {
  basePath: string;
  days: LocalDate[];
  monthPrefix: string; // "YYYY-MM"; days outside it are dimmed
  today: LocalDate;
  shifts: CalendarShift[];
  blocks: CalendarBlock[];
  events: CalendarEvent[];
  onDayClick?: (date: LocalDate) => void;
  onShiftClick: (shift: CalendarShift) => void;
  onBlockClick?: (block: CalendarBlock) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function MonthGrid({
  basePath,
  days,
  monthPrefix,
  today,
  shifts,
  blocks,
  events,
  onDayClick,
  onShiftClick,
  onBlockClick,
  onEventClick,
}: MonthGridProps) {
  const byDate = groupByDate(shifts);
  const eventsByDate = groupEventsByDate(events);

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
            eventsByDate={eventsByDate}
            blocks={blocks}
            monthPrefix={monthPrefix}
            today={today}
            basePath={basePath}
            onDayClick={onDayClick}
            onShiftClick={onShiftClick}
            onBlockClick={onBlockClick}
            onEventClick={onEventClick}
          />
        ))}
      </ul>
    </div>
  );
}

interface DayListItemProps {
  date: string;
  byDate: Map<string, CalendarShift[]>;
  eventsByDate: Map<string, CalendarEvent[]>;
  blocks: CalendarBlock[];
  monthPrefix: string;
  today: string;
  basePath: string;
  onDayClick?: (date: string) => void;
  onShiftClick: (shift: CalendarShift) => void;
  onBlockClick?: (block: CalendarBlock) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const DayListItem = ({
  date,
  byDate,
  eventsByDate,
  blocks,
  monthPrefix,
  today,
  basePath,
  onDayClick,
  onShiftClick,
  onBlockClick,
  onEventClick,
}: DayListItemProps) => {
  const segments = blockSegments(blocks, date);
  const items = [
    ...(eventsByDate.get(date) ?? []).map((event) => (
      <EventMarker key={event.id} event={event} onClick={onEventClick} />
    )),
    ...segments.map((segment) => (
      <BlockMarker
        key={`${segment.block.id}-${date}`}
        segment={segment}
        onClick={onBlockClick}
      />
    )),
    ...(byDate.get(date) ?? []).map((shift) => (
      <ShiftChip key={shift.id} shift={shift} onClick={onShiftClick} />
    )),
  ];
  const hidden = items.length - MAX_CHIPS;
  const outside = !date.startsWith(monthPrefix);
  const shade = coversWholeDay(segments) ? "bg-red-500/10" : "";

  return (
    <li
      key={date}
      className={`relative min-h-24 border-b border-s border-gray-200 p-1 ${outside ? "bg-foreground/5 text-gray-400" : shade}`}
    >
      {onDayClick && (
        <button
          type="button"
          aria-label={`הוספה ב-${date}`}
          onClick={() => onDayClick(date)}
          className="absolute inset-0"
        />
      )}
      <div className="pointer-events-none relative flex flex-col gap-0.5">
        <Link
          href={calendarHref(basePath, "day", date)}
          className={`pointer-events-auto self-start rounded-full px-1.5 text-xs ${date === today ? "bg-foreground text-background" : ""}`}
        >
          {Number(date.slice(8))}
        </Link>
        {items.slice(0, MAX_CHIPS)}
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
