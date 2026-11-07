import { inputClass } from "@/app/ui/styles";
import {
  formatDayMonth,
  startOfWeek,
  weekDays,
  weekdayShort,
} from "@/lib/time";
import type { LocalDate } from "@/lib/types";

interface WeekDaysFieldsProps {
  date: LocalDate;
  checkedDays?: string[]; // day indexes; defaults to the day of `date`
}

// Weekday checkboxes for the week containing `date`, plus the week start the server needs.
export function WeekDaysFields({ date, checkedDays }: WeekDaysFieldsProps) {
  const weekStart = startOfWeek(date);
  const days = weekDays(weekStart);
  const checked = checkedDays ?? [String(days.indexOf(date))];

  return (
    <>
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
                defaultChecked={checked.includes(String(index))}
              />
              {weekdayShort(day)} {formatDayMonth(day)}
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}

interface RepeatWeeksFieldProps {
  value?: string;
}

export function RepeatWeeksField({ value }: RepeatWeeksFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      חזרה למשך כמה שבועות
      <input
        name="repeatWeeks"
        type="number"
        min={1}
        max={12}
        defaultValue={value || 1}
        className={inputClass}
      />
    </label>
  );
}
