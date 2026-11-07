"use client";

import { useActionState, useEffect } from "react";
import { deleteShift, updateShift } from "@/app/actions/shifts";
import { FormFooter, TimeFields } from "@/app/ui/admin/shift-fields";
import { inputClass, smallButtonClass } from "@/app/ui/styles";
import type { CalendarShift } from "@/lib/interfaces";

export function EditShiftForm({
  shift,
  onDone,
  onCancel,
}: {
  shift: CalendarShift;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    updateShift.bind(null, shift.id),
    {},
  );

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  const confirmMessage =
    shift.workerCount > 0
      ? `למשמרת זו רשומים ${shift.workerCount} עובדים. למחוק אותה?`
      : "למחוק את המשמרת?";

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          תאריך
          <input
            name="date"
            type="date"
            required
            defaultValue={state.values?.date ?? shift.date}
            className={inputClass}
          />
        </label>

        <TimeFields
          values={state.values}
          defaults={{
            startTime: shift.startTime,
            endTime: shift.endTime,
            label: shift.label ?? "",
          }}
        />

        <FormFooter
          state={state}
          pending={pending}
          submitLabel="שמירה"
          onCancel={onCancel}
        />
      </form>

      <form
        action={async () => {
          await deleteShift(shift.id);
          onDone();
        }}
        onSubmit={(event) => {
          if (!confirm(confirmMessage)) event.preventDefault();
        }}
        className="border-t border-gray-200 pt-3"
      >
        <button type="submit" className={smallButtonClass}>
          מחיקת המשמרת
        </button>
      </form>
    </div>
  );
}
