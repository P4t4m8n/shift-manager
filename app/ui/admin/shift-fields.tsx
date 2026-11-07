import { buttonClass, inputClass, smallButtonClass } from "@/app/ui/styles";
import type { FormResult, ShiftFormValues } from "@/lib/interfaces";

export function TimeFields({
  values,
  defaults,
}: {
  values?: ShiftFormValues;
  defaults?: ShiftFormValues;
}) {
  return (
    <>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          שעת התחלה
          <input
            name="startTime"
            type="time"
            required
            defaultValue={values?.startTime ?? defaults?.startTime}
            className={inputClass}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          שעת סיום
          <input
            name="endTime"
            type="time"
            required
            defaultValue={values?.endTime ?? defaults?.endTime}
            className={inputClass}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        תיאור (לא חובה)
        <input
          name="label"
          maxLength={50}
          placeholder="למשל: משמרת בוקר"
          defaultValue={values?.label ?? defaults?.label}
          className={inputClass}
        />
      </label>
    </>
  );
}

export function FormFooter({
  state,
  pending,
  submitLabel,
  onCancel,
}: {
  state: FormResult<unknown>;
  pending: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <>
      {state.message && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "שומר..." : submitLabel}
        </button>
        {state.needsConfirm && (
          <button
            type="submit"
            name="force"
            value="1"
            disabled={pending}
            className={smallButtonClass}
          >
            שמירה בכל זאת
          </button>
        )}
        <button type="button" onClick={onCancel} className="text-sm underline">
          ביטול
        </button>
      </div>
    </>
  );
}
