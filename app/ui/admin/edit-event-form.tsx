"use client";

import { useActionState, useEffect } from "react";
import { deleteEvent, updateEvent } from "@/app/actions/events";
import { DeleteItemForm } from "@/app/ui/admin/delete-item-form";
import { EventFields } from "@/app/ui/admin/event-fields";
import { FormFooter } from "@/app/ui/admin/shift-fields";
import { inputClass } from "@/app/ui/styles";
import type { CalendarEvent } from "@/lib/interfaces";

interface EditEventFormProps {
  event: CalendarEvent;
  onDone: () => void;
  onCancel: () => void;
}

export function EditEventForm({ event, onDone, onCancel }: EditEventFormProps) {
  const [state, action, pending] = useActionState(
    updateEvent.bind(null, event.id),
    {},
  );

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          תאריך
          <input
            name="date"
            type="date"
            required
            defaultValue={state.values?.date ?? event.date}
            className={inputClass}
          />
        </label>
        <EventFields
          values={state.values}
          defaults={{
            title: event.title,
            startTime: event.startTime ?? "",
            closesSignup: event.closesSignup ? "1" : "",
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
        action={deleteEvent.bind(null, event.id)}
        label="מחיקת האירוע"
        confirmMessage="למחוק את האירוע?"
        onDone={onDone}
      />
    </div>
  );
}
