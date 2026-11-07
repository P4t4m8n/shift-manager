"use client";

import type { BlockSegment } from "@/lib/calendar";
import { MINUTES_IN_DAY } from "@/lib/consts/calendar.const";
import type { CalendarBlock, CalendarEvent } from "@/lib/interfaces";
import { formatMinutes } from "@/lib/time";

type MarkerTone = "event" | "closed";

const TONE_CLASS: Record<MarkerTone, string> = {
  event: "border-dashed border-foreground/40",
  closed: "border-red-500/50 bg-red-500/10 text-red-600",
};

interface MarkerProps {
  tone: MarkerTone;
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}

// Display-only unless an onClick is given (admins edit, workers just read).
function Marker({ tone, title, onClick, children }: MarkerProps) {
  const className = `pointer-events-auto block w-full truncate rounded border px-1 text-start text-xs leading-tight ${TONE_CLASS[tone]}`;

  if (!onClick) {
    return (
      <span title={title} className={className}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" title={title} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function Time({ children }: { children: React.ReactNode }) {
  return <bdi dir="ltr">{children}</bdi>;
}

interface EventMarkerProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
}

export function EventMarker({ event, onClick }: EventMarkerProps) {
  const title = event.closesSignup
    ? `${event.title} · ההרשמה סגורה`
    : event.title;

  return (
    <Marker
      tone={event.closesSignup ? "closed" : "event"}
      title={title}
      onClick={onClick && (() => onClick(event))}
    >
      {event.startTime && <Time>{event.startTime}</Time>} {event.title}
    </Marker>
  );
}

interface BlockMarkerProps {
  segment: BlockSegment;
  onClick?: (block: CalendarBlock) => void;
}

export function BlockMarker({ segment, onClick }: BlockMarkerProps) {
  const { block, startMinute, endMinute } = segment;
  const wholeDay = startMinute === 0 && endMinute === MINUTES_IN_DAY;
  const range = `${formatMinutes(startMinute)}–${formatMinutes(endMinute)}`;
  const title = ["חסימה", wholeDay ? "" : range, block.reason]
    .filter(Boolean)
    .join(" · ");

  return (
    <Marker
      tone="closed"
      title={title}
      onClick={onClick && (() => onClick(block))}
    >
      חסימה {!wholeDay && <Time>{range}</Time>}
      {block.reason && ` · ${block.reason}`}
    </Marker>
  );
}
