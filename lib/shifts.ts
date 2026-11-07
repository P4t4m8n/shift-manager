import { field } from "@/lib/form";
import type { ShiftFormValues } from "@/lib/interfaces";
import { isValidTime } from "@/lib/time";
import type { LocalTime } from "@/lib/types";

export const MAX_LABEL_LENGTH = 50;

export interface ShiftFields {
  startTime: LocalTime;
  endTime: LocalTime;
  label?: string;
}

export function parseShiftFields(
  formData: FormData,
): { error: string } | { data: ShiftFields } {
  const startTime = field(formData, "startTime");
  const endTime = field(formData, "endTime");
  const label = field(formData, "label");

  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return { error: "יש להזין שעת התחלה ושעת סיום" };
  }
  if (endTime <= startTime) {
    return { error: "שעת הסיום חייבת להיות אחרי שעת ההתחלה" };
  }
  if (label.length > MAX_LABEL_LENGTH) {
    return { error: `התיאור ארוך מדי (עד ${MAX_LABEL_LENGTH} תווים)` };
  }
  return { data: { startTime, endTime, ...(label ? { label } : {}) } };
}

export function overlaps(
  a: Pick<ShiftFields, "startTime" | "endTime">,
  b: Pick<ShiftFields, "startTime" | "endTime">,
): boolean {
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

// Echoed back to the form so fields keep their values after a failed submit.
export function echoValues(formData: FormData): ShiftFormValues {
  return {
    date: field(formData, "date"),
    startTime: field(formData, "startTime"),
    endTime: field(formData, "endTime"),
    label: field(formData, "label"),
    repeatWeeks: field(formData, "repeatWeeks"),
    days: formData.getAll("days").map(String),
  };
}
