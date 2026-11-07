"use client";

import { useActionState, useEffect } from "react";
import { createEvents } from "@/app/actions/events";
import { EventFields } from "@/app/ui/admin/event-fields";
import {
  RepeatWeeksField,
  WeekDaysFields,
} from "@/app/ui/admin/schedule-fields";
import { FormFooter } from "@/app/ui/admin/shift-fields";
import type { LocalDate } from "@/lib/types";

interface CreateEventFormProps {
  date: LocalDate;
  startTime?: string;
  onDone: () => void;
  onCancel: () => void;
}

export function CreateEventForm({
  date,
  startTime,
  onDone,
  onCancel,
}: CreateEventFormProps) {
  const [state, action, pending] = useActionState(createEvents, {});

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <WeekDaysFields date={date} checkedDays={state.values?.days} />
      <EventFields values={state.values} defaults={{ startTime }} />
      <RepeatWeeksField value={state.values?.repeatWeeks} />
      <FormFooter
        state={state}
        pending={pending}
        submitLabel="יצירת אירוע"
        onCancel={onCancel}
      />
    </form>
  );
}
