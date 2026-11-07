"use client";

import { useCallback, useState } from "react";
import { CreateItemTabs } from "@/app/ui/admin/create-item-tabs";
import { EditBlockForm } from "@/app/ui/admin/edit-block-form";
import { EditEventForm } from "@/app/ui/admin/edit-event-form";
import { EditShiftForm } from "@/app/ui/admin/edit-shift-form";
import { Modal } from "@/app/ui/modal";
import { Calendar } from "@/app/ui/calendar/calendar";
import { CalendarToolbar } from "@/app/ui/calendar/calendar-toolbar";
import { smallButtonClass } from "@/app/ui/styles";
import { formatFullDate } from "@/lib/time";

import type {
  CalendarBlock,
  CalendarEvent,
  CalendarShift,
} from "@/lib/interfaces";
import type { LocalDate } from "@/lib/types";
import type { CalendarView } from "@/lib/types/calendar.type";

const BASE_PATH = "/admin/shifts";

type DialogState =
  | { kind: "create"; date: LocalDate; startTime?: string }
  | { kind: "edit-shift" | "edit-block" | "edit-event"; id: string };

interface AdminShiftCalendarProps {
  view: CalendarView;
  date: LocalDate;
  today: LocalDate;
  shifts: CalendarShift[];
  blocks: CalendarBlock[];
  events: CalendarEvent[];
}

export function AdminShiftCalendar({
  view,
  date,
  today,
  shifts,
  blocks,
  events,
}: AdminShiftCalendarProps) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const close = useCallback(() => setDialog(null), []);

  const editingShift =
    dialog?.kind === "edit-shift"
      ? shifts.find((shift) => shift.id === dialog.id)
      : undefined;
  const editingBlock =
    dialog?.kind === "edit-block"
      ? blocks.find((block) => block.id === dialog.id)
      : undefined;
  const editingEvent =
    dialog?.kind === "edit-event"
      ? events.find((event) => event.id === dialog.id)
      : undefined;

  const calendatToolBarButtonACtion = () =>
    setDialog({
      kind: "create",
      date: view === "month" ? today : date,
    });

  const onSlotClick = (slotDate: LocalDate, startTime?: string) =>
    setDialog({ kind: "create", date: slotDate, startTime });

  return (
    <div className="flex flex-col gap-3">
      <CalendarToolbar
        basePath={BASE_PATH}
        view={view}
        date={date}
        today={today}
        actions={
          <button
            type="button"
            className={smallButtonClass}
            onClick={calendatToolBarButtonACtion}
          >
            + הוספה
          </button>
        }
      />

      <Calendar
        basePath={BASE_PATH}
        view={view}
        date={date}
        today={today}
        shifts={shifts}
        blocks={blocks}
        events={events}
        onSlotClick={onSlotClick}
        onShiftClick={(shift) =>
          setDialog({ kind: "edit-shift", id: shift.id })
        }
        onBlockClick={(block) =>
          setDialog({ kind: "edit-block", id: block.id })
        }
        onEventClick={(event) =>
          setDialog({ kind: "edit-event", id: event.id })
        }
      />

      {dialog?.kind === "create" && (
        <Modal title={`הוספה · ${formatFullDate(dialog.date)}`} onClose={close}>
          <CreateItemTabs
            key={`${dialog.date}-${dialog.startTime ?? ""}`}
            date={dialog.date}
            startTime={dialog.startTime}
            onDone={close}
            onCancel={close}
          />
        </Modal>
      )}

      {editingShift && (
        <Modal title="עריכת משמרת" onClose={close}>
          <EditShiftForm
            key={editingShift.id}
            shift={editingShift}
            onDone={close}
            onCancel={close}
          />
        </Modal>
      )}

      {editingBlock && (
        <Modal title="עריכת חסימה" onClose={close}>
          <EditBlockForm
            key={editingBlock.id}
            block={editingBlock}
            onDone={close}
            onCancel={close}
          />
        </Modal>
      )}

      {editingEvent && (
        <Modal title="עריכת אירוע" onClose={close}>
          <EditEventForm
            key={editingEvent.id}
            event={editingEvent}
            onDone={close}
            onCancel={close}
          />
        </Modal>
      )}
    </div>
  );
}
