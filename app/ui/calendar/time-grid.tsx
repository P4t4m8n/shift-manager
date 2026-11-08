"use client";

import Link from "next/link";
import { BlockMarker, EventMarker } from "@/app/ui/calendar/day-markers";
import { ShiftChip } from "@/app/ui/calendar/shift-chip";
import {
  BlockSegment,
  blockSegments,
  calendarHref,
  groupByDate,
  groupEventsByDate,
  hourRange,
  layoutDay,
} from "@/lib/calendar";
import { formatDayMonth, toMinutes, weekdayShort } from "@/lib/time";

import type {
  CalendarBlock,
  CalendarEvent,
  CalendarShift,
} from "@/lib/interfaces";
import type { LocalDate } from "@/lib/types";

const HOUR_PX = 56;
const MIN_SHIFT_PX = 22;
const LINE_COLOR = "rgb(229 231 235)";
const BLOCK_SHADE =
  "repeating-linear-gradient(135deg, rgb(239 68 68 / 0.14) 0 6px, transparent 6px 12px)";

interface TimeGridProps {
  basePath: string;
  days: LocalDate[];
  today: LocalDate;
  shifts: CalendarShift[];
  blocks: CalendarBlock[];
  events: CalendarEvent[];
  onSlotClick?: (date: LocalDate, startTime?: string) => void;
  onShiftClick: (shift: CalendarShift) => void;
  onBlockClick?: (block: CalendarBlock) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

// Used for both the week view (7 columns) and the day view (1 column).
export function TimeGrid({
  basePath,
  days,
  today,
  shifts,
  blocks,
  events,
  onSlotClick,
  onShiftClick,
  onBlockClick,
  onEventClick,
}: TimeGridProps) {
  const byDate = groupByDate(shifts);
  const eventsByDate = groupEventsByDate(events);
  const segmentsByDate = new Map(
    days.map((date) => [date, blockSegments(blocks, date)]),
  );

  const hasMarkers = days.some(
    (date) =>
      (eventsByDate.get(date)?.length ?? 0) > 0 ||
      (segmentsByDate.get(date)?.length ?? 0) > 0,
  );
  const { startHour, endHour } = hourRange(shifts);
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i,
  );
  const columns = `3rem repeat(${days.length}, minmax(0, 1fr))`;
  const single = days.length === 1;

  return (
    <div className="overflow-hidden rounded border border-gray-200">
      <TimeGridHeaders
        columns={columns}
        days={days}
        single={single}
        basePath={basePath}
        today={today}
      />

      <TimeGridMarkers
        columns={columns}
        days={days}
        eventsByDate={eventsByDate}
        segmentsByDate={segmentsByDate}
        onEventClick={onEventClick}
        onBlockClick={onBlockClick}
        hasMarkers={hasMarkers}
      />

      <TimeGridBody
        columns={columns}
        days={days}
        startHour={startHour}
        hours={hours}
        byDate={byDate}
        segmentsByDate={segmentsByDate}
        onSlotClick={onSlotClick}
        onShiftClick={onShiftClick}
      />
    </div>
  );
}
interface TimeGridHeadersProps {
  columns: string;
  days: LocalDate[];
  single: boolean;
  basePath: string;
  today: LocalDate;
}
const TimeGridHeaders = ({
  columns,
  days,
  single,
  basePath,
  today,
}: TimeGridHeadersProps) => {
  return (
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
  );
};

interface TimeGridMarkersProps {
  hasMarkers: boolean;
  columns: string;
  days: LocalDate[];
  eventsByDate: Map<LocalDate, CalendarEvent[]>;
  segmentsByDate: Map<LocalDate, BlockSegment[]>;
  onEventClick?: (event: CalendarEvent) => void;
  onBlockClick?: (block: CalendarBlock) => void;
}
const TimeGridMarkers = ({
  hasMarkers,
  columns,
  days,
  eventsByDate,
  segmentsByDate,
  onEventClick,
  onBlockClick,
}: TimeGridMarkersProps) => {
  if (!hasMarkers) return null;
  return (
    <div
      className="grid border-b border-gray-200"
      style={{ gridTemplateColumns: columns }}
    >
      <div />
      {days.map((date) => (
        <div
          key={date}
          className="flex min-w-0 flex-col gap-0.5 border-s border-gray-200 p-0.5"
        >
          {(eventsByDate.get(date) ?? []).map((event) => (
            <EventMarker key={event.id} event={event} onClick={onEventClick} />
          ))}
          {(segmentsByDate.get(date) ?? []).map((segment) => (
            <BlockMarker
              key={segment.block.id}
              segment={segment}
              onClick={onBlockClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface TimeGridCellsProps {
  hours: number[];
  columns: string;
  startHour: number;
  days: string[];
  segmentsByDate: Map<string, BlockSegment[]>;
  byDate: Map<string, CalendarShift[]>;
  onSlotClick?: (date: string, time?: string) => void;
  onShiftClick: (shift: CalendarShift) => void;
}

const TimeGridBody = ({
  hours,
  columns,
  startHour,
  days,
  segmentsByDate,
  onSlotClick,
  onShiftClick,
  byDate,
}: TimeGridCellsProps) => {
  return (
    <div className="grid" style={{ gridTemplateColumns: columns }}>
      <div className="relative" style={{ height: hours.length * HOUR_PX }}>
        {hours.map((hour) => (
          <span
            key={hour}
            dir="ltr"
            className="absolute inset-e-1 -translate-y-1/2 text-xs text-gray-500"
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
          {onSlotClick && (
            <button
              type="button"
              aria-label={`הוספה ב-${date}`}
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
          )}
          {(segmentsByDate.get(date) ?? []).map((segment) => {
            const from = Math.max(segment.startMinute, startHour * 60);
            const to = Math.min(
              segment.endMinute,
              (startHour + hours.length) * 60,
            );
            if (to <= from) return null;
            return (
              <div
                key={segment.block.id}
                aria-hidden
                className="pointer-events-none absolute inset-x-0"
                style={{
                  top: ((from - startHour * 60) / 60) * HOUR_PX,
                  height: ((to - from) / 60) * HOUR_PX,
                  backgroundImage: BLOCK_SHADE,
                }}
              />
            );
          })}
          {layoutDay(byDate.get(date) ?? []).map(({ shift, lane, lanes }) => {
            const start = toMinutes(shift.startTime) - startHour * 60;
            const length =
              toMinutes(shift.endTime) - toMinutes(shift.startTime);
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
          })}
        </div>
      ))}
    </div>
  );
};
