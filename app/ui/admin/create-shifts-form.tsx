"use client";

import { useActionState, useEffect } from "react";
import { createShifts } from "@/app/actions/shifts";
import { FormFooter, TimeFields } from "@/app/ui/admin/shift-fields";
import {
  RepeatWeeksField,
  WeekDaysFields,
} from "@/app/ui/admin/schedule-fields";
import type { LocalDate } from "@/lib/types";

interface CreateShiftsFormProps {
  date: LocalDate;
  startTime?: string;
  onDone: () => void;
  onCancel: () => void;
}

export function CreateShiftsForm({
  date,
  startTime,
  onDone,
  onCancel,
}: CreateShiftsFormProps) {
  const [state, action, pending] = useActionState(createShifts, {});

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <WeekDaysFields date={date} checkedDays={state.values?.days} />
      <TimeFields values={state.values} defaults={{ startTime }} />
      <RepeatWeeksField value={state.values?.repeatWeeks} />
      <FormFooter
        state={state}
        pending={pending}
        submitLabel="יצירת משמרות"
        onCancel={onCancel}
      />
    </form>
  );
}
