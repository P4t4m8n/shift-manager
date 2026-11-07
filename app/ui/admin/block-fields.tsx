import { inputClass } from "@/app/ui/styles";
import type { BlockFormValues } from "@/lib/interfaces";
import { MAX_REASON_LENGTH } from "@/lib/blocks";

interface BlockFieldsProps {
  values?: BlockFormValues; // echoed after a failed submit; wins over defaults
  defaults?: BlockFormValues;
}

export function BlockFields({ values, defaults }: BlockFieldsProps) {
  const pick = (key: keyof BlockFormValues) => values?.[key] ?? defaults?.[key];

  return (
    <>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          מתאריך
          <input
            name="startDate"
            type="date"
            required
            defaultValue={pick("startDate")}
            className={inputClass}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          משעה
          <input
            name="startTime"
            type="time"
            required
            defaultValue={pick("startTime")}
            className={inputClass}
          />
        </label>
      </div>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          עד תאריך
          <input
            name="endDate"
            type="date"
            required
            defaultValue={pick("endDate")}
            className={inputClass}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          עד שעה
          <input
            name="endTime"
            type="time"
            required
            defaultValue={pick("endTime")}
            className={inputClass}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        סיבה (לא חובה)
        <input
          name="reason"
          maxLength={MAX_REASON_LENGTH}
          placeholder="למשל: חג"
          defaultValue={pick("reason")}
          className={inputClass}
        />
      </label>
    </>
  );
}
