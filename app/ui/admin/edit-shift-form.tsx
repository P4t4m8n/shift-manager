"use client";

import { useActionState, useEffect } from "react";
import { deleteShift, updateShift } from "@/app/actions/shifts";
import { DeleteItemForm } from "@/app/ui/admin/delete-item-form";
import { FormFooter, TimeFields } from "@/app/ui/admin/shift-fields";
import { inputClass } from "@/app/ui/styles";
import type { CalendarShift } from "@/lib/interfaces";

interface EditShiftFormProps {
  shift: CalendarShift;
  onDone: () => void;
  onCancel: () => void;
}

export function EditShiftForm({
  shift,
  onDone,
  onCancel,
}: EditShiftFormProps) {
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

      <DeleteItemForm
        action={deleteShift.bind(null, shift.id)}
        label="מחיקת המשמרת"
        confirmMessage={confirmMessage}
        onDone={onDone}
      />
    </div>
  );
}
