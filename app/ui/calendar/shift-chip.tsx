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
  const title = [range, shift.label, `${shift.workerCount} עובדים`]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      title={title}
      onClick={() => onClick(shift)}
      style={style}
      className={`pointer-events-auto overflow-hidden rounded border border-foreground/30 bg-foreground/10 px-1 text-start text-xs leading-tight ${className}`}
    >
      <span className="block">
        <span dir="ltr" className="inline-block">
          {showDetails ? range : shift.startTime}
        </span>
      </span>
      {shift.label && <span className="block truncate">{shift.label}</span>}
      {showDetails && (
        <span className="block text-gray-500">{shift.workerCount} עובדים</span>
      )}
    </button>
  );
}
