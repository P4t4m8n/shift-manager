import { field } from "@/lib/form";
import type { EventFormValues } from "@/lib/interfaces";
import { isValidTime } from "@/lib/time";
import type { LocalTime } from "@/lib/types";

export const MAX_TITLE_LENGTH = 60;

export interface EventFields {
  title: string;
  startTime?: LocalTime;
  closesSignup: boolean;
}

export function parseEventFields(
  formData: FormData,
): { error: string } | { data: EventFields } {
  const title = field(formData, "title");
  const startTime = field(formData, "startTime");
  const closesSignup = formData.get("closesSignup") === "1";

  if (title.length === 0) return { error: "יש להזין שם לאירוע" };
  if (title.length > MAX_TITLE_LENGTH) {
    return { error: `השם ארוך מדי (עד ${MAX_TITLE_LENGTH} תווים)` };
  }
  if (startTime && !isValidTime(startTime)) return { error: "שעה לא תקינה" };

  return {
    data: { title, closesSignup, ...(startTime ? { startTime } : {}) },
  };
}

// Echoed back to the form so fields keep their values after a failed submit.
export function echoEventValues(formData: FormData): EventFormValues {
  return {
    date: field(formData, "date"),
    title: field(formData, "title"),
    startTime: field(formData, "startTime"),
    closesSignup: formData.get("closesSignup") === "1" ? "1" : "",
    repeatWeeks: field(formData, "repeatWeeks"),
    days: formData.getAll("days").map(String),
  };
}
