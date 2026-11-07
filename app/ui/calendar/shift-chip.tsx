"use client";

import type { CalendarShift } from "@/lib/interfaces";

interface ShiftChipProps {
  shift: CalendarShift;
  onClick: (shift: CalendarShift) => void;
  className?: string;
  style?: React.CSSProperties;
  showDetails?: boolean;
}

// A shift shown inside the calendar. Clicking it is handled by the parent.
export function ShiftChip({
  shift,
  onClick,
  className = "",
  style,
  showDetails = false,
}: ShiftChipProps) {
  const range = `${shift.startTime}–${shift.endTime}`;
  const title = [
    range,
    shift.label,
    `${shift.workerCount} עובדים`,
    shift.signedUp && "נרשמת",
    shift.blockedReason,
  ]
    .filter(Boolean)
    .join(" · ");

  // Worker view only: filled when signed up, dimmed when sign up isn't possible.
  const tone = shift.signedUp
    ? "border-foreground bg-foreground text-background"
    : shift.blockedReason
      ? "border-foreground/20 bg-foreground/5 opacity-60"
      : "border-foreground/30 bg-foreground/10";

  return (
    <button
      type="button"
      title={title}
      onClick={() => onClick(shift)}
      style={style}
      className={`pointer-events-auto overflow-hidden rounded border px-1 text-start text-xs leading-tight ${tone} ${className}`}
    >
      <span className="block">
        <span dir="ltr" className="inline-block">
          {showDetails ? range : shift.startTime}
        </span>
      </span>
      {shift.label && <span className="block truncate">{shift.label}</span>}
      {showDetails && (
        <span
          className={`block ${shift.signedUp ? "opacity-80" : "text-gray-500"}`}
        >
          {shift.workerCount} עובדים
        </span>
      )}
    </button>
  );
}
