"use client";

import { useActionState, useEffect } from "react";
import { createShifts } from "@/app/actions/shifts";
import { FormFooter, TimeFields } from "@/app/ui/admin/shift-fields";
import { inputClass } from "@/app/ui/styles";
import {
  formatDayMonth,
  startOfWeek,
  weekDays,
  weekdayShort,
} from "@/lib/time";
import type { LocalDate } from "@/lib/types";

export function CreateShiftsForm({
  date,
  startTime,
  onDone,
  onCancel,
}: {
  date: LocalDate;
  startTime?: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(createShifts, {});
  const weekStart = startOfWeek(date);
  const days = weekDays(weekStart);
  const checkedDays = state.values?.days ?? [String(days.indexOf(date))];

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="weekStart" value={weekStart} />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm">ימים (באותו שבוע)</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {days.map((day, index) => (
            <label key={day} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                name="days"
                value={index}
                defaultChecked={checkedDays.includes(String(index))}
              />
              {weekdayShort(day)} {formatDayMonth(day)}
            </label>
          ))}
        </div>
      </fieldset>

      <TimeFields values={state.values} defaults={{ startTime }} />

      <label className="flex flex-col gap-1 text-sm">
        חזרה למשך כמה שבועות
        <input
          name="repeatWeeks"
          type="number"
          min={1}
          max={12}
          defaultValue={state.values?.repeatWeeks || 1}
          className={inputClass}
        />
      </label>

      <FormFooter
        state={state}
        pending={pending}
        submitLabel="יצירת משמרות"
        onCancel={onCancel}
      />
    </form>
  );
}
