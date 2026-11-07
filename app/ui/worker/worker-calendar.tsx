"use client";

import { useCallback, useState } from "react";
import { Calendar } from "@/app/ui/calendar/calendar";
import { CalendarToolbar } from "@/app/ui/calendar/calendar-toolbar";
import { Modal } from "@/app/ui/modal";
import { ShiftDialogContent } from "@/app/ui/worker/shift-dialog-content";

import type {
  CalendarBlock,
  CalendarEvent,
  CalendarShift,
} from "@/lib/interfaces";
import type { LocalDate } from "@/lib/types";
import type { CalendarView } from "@/lib/types/calendar.type";

const BASE_PATH = "/";

interface WorkerCalendarProps {
  view: CalendarView;
  date: LocalDate;
  today: LocalDate;
  shifts: CalendarShift[];
  blocks: CalendarBlock[];
  events: CalendarEvent[];
}

// Read-only calendar: the only thing a worker can click is a shift.
export function WorkerCalendar({
  view,
  date,
  today,
  shifts,
  blocks,
  events,
}: WorkerCalendarProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const close = useCallback(() => setSelectedId(null), []);

  // Looked up by id so the dialog shows fresh data after the page refreshes.
  const selected = shifts.find((shift) => shift.id === selectedId);

  return (
    <div className="flex flex-col gap-3">
      <CalendarToolbar
        basePath={BASE_PATH}
        view={view}
        date={date}
        today={today}
      />

      <Calendar
        basePath={BASE_PATH}
        view={view}
        date={date}
        today={today}
        shifts={shifts}
        blocks={blocks}
        events={events}
        onShiftClick={(shift) => setSelectedId(shift.id)}
      />

      {selected && (
        <Modal title="משמרת" onClose={close}>
          <ShiftDialogContent
            key={selected.id}
            shift={selected}
            onDone={close}
            onClose={close}
          />
        </Modal>
      )}
    </div>
  );
}
