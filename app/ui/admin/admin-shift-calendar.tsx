"use client";

import { useCallback, useState } from "react";
import { CreateShiftsForm } from "@/app/ui/admin/create-shifts-form";
import { EditShiftForm } from "@/app/ui/admin/edit-shift-form";
import { Modal } from "@/app/ui/admin/modal";
import { Calendar } from "@/app/ui/calendar/calendar";
import { CalendarToolbar } from "@/app/ui/calendar/calendar-toolbar";
import { smallButtonClass } from "@/app/ui/styles";
import type { CalendarView } from "@/lib/calendar";
import type { CalendarShift } from "@/lib/interfaces";
import { formatFullDate } from "@/lib/time";
import type { LocalDate } from "@/lib/types";

const BASE_PATH = "/admin/shifts";

type DialogState =
  | { kind: "create"; date: LocalDate; startTime?: string }
  | { kind: "edit"; shiftId: string };

export function AdminShiftCalendar({
  view,
  date,
  today,
  shifts,
}: {
  view: CalendarView;
  date: LocalDate;
  today: LocalDate;
  shifts: CalendarShift[];
}) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const close = useCallback(() => setDialog(null), []);

  const editing =
    dialog?.kind === "edit"
      ? shifts.find((shift) => shift.id === dialog.shiftId)
      : undefined;

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
            onClick={() =>
              setDialog({ kind: "create", date: view === "month" ? today : date })
            }
          >
            + משמרת
          </button>
        }
      />

      <Calendar
        basePath={BASE_PATH}
        view={view}
        date={date}
        today={today}
        shifts={shifts}
        onSlotClick={(slotDate, startTime) =>
          setDialog({ kind: "create", date: slotDate, startTime })
        }
        onShiftClick={(shift) => setDialog({ kind: "edit", shiftId: shift.id })}
      />

      {dialog?.kind === "create" && (
        <Modal
          title={`הוספת משמרות · ${formatFullDate(dialog.date)}`}
          onClose={close}
        >
          <CreateShiftsForm
            key={`${dialog.date}-${dialog.startTime ?? ""}`}
            date={dialog.date}
            startTime={dialog.startTime}
            onDone={close}
            onCancel={close}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="עריכת משמרת" onClose={close}>
          <EditShiftForm
            key={editing.id}
            shift={editing}
            onDone={close}
            onCancel={close}
          />
        </Modal>
      )}
    </div>
  );
}
