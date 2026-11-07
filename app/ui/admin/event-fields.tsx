import { inputClass } from "@/app/ui/styles";
import { MAX_TITLE_LENGTH } from "@/lib/events";
import type { EventFormValues } from "@/lib/interfaces";

interface EventFieldsProps {
  values?: EventFormValues; // echoed after a failed submit; wins over defaults
  defaults?: EventFormValues;
}

type TextKey = Exclude<keyof EventFormValues, "days">;

export function EventFields({ values, defaults }: EventFieldsProps) {
  const pick = (key: TextKey) => values?.[key] ?? defaults?.[key];

  return (
    <>
      <label className="flex flex-col gap-1 text-sm">
        שם האירוע
        <input
          name="title"
          required
          maxLength={MAX_TITLE_LENGTH}
          placeholder="למשל: ישיבת צוות"
          defaultValue={pick("title")}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        שעה (לא חובה)
        <input
          name="startTime"
          type="time"
          defaultValue={pick("startTime")}
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="closesSignup"
          value="1"
          defaultChecked={pick("closesSignup") === "1"}
        />
        סגירת הרשמה למשמרות ביום זה
      </label>
    </>
  );
}
