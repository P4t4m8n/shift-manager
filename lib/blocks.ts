import { field } from "@/lib/form";
import type { BlockFormValues } from "@/lib/interfaces";
import { isValidDate, isValidTime } from "@/lib/time";
import type { LocalDateTime } from "@/lib/types";

export const MAX_REASON_LENGTH = 100;

export interface BlockFields {
  startAt: LocalDateTime;
  endAt: LocalDateTime;
  reason?: string;
}

export function parseBlockFields(
  formData: FormData,
): { error: string } | { data: BlockFields } {
  const startDate = field(formData, "startDate");
  const startTime = field(formData, "startTime");
  const endDate = field(formData, "endDate");
  const endTime = field(formData, "endTime");
  const reason = field(formData, "reason");

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return { error: "יש להזין תאריך התחלה ותאריך סיום" };
  }
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return { error: "יש להזין שעת התחלה ושעת סיום" };
  }

  const startAt = `${startDate}T${startTime}`;
  const endAt = `${endDate}T${endTime}`;
  if (endAt <= startAt) return { error: "סוף החסימה חייב להיות אחרי תחילתה" };
  if (reason.length > MAX_REASON_LENGTH) {
    return { error: `הסיבה ארוכה מדי (עד ${MAX_REASON_LENGTH} תווים)` };
  }
  return { data: { startAt, endAt, ...(reason ? { reason } : {}) } };
}

// Echoed back to the form so fields keep their values after a failed submit.
export function echoBlockValues(formData: FormData): BlockFormValues {
  return {
    startDate: field(formData, "startDate"),
    startTime: field(formData, "startTime"),
    endDate: field(formData, "endDate"),
    endTime: field(formData, "endTime"),
    reason: field(formData, "reason"),
    repeatWeeks: field(formData, "repeatWeeks"),
  };
}
