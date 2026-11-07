import { overlaps } from "@/lib/shifts";
import type { LocalDateTime } from "@/lib/types";

interface ShiftTimes {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface SignupContext {
  now: LocalDateTime;
  blocks: { startAt: string; endAt: string; reason?: string }[];
  events: { date: string; title: string; closesSignup: boolean }[];
  // The worker's own shifts that day (any not yet joined are compared for overlap).
  myShifts: ShiftTimes[];
}

export const SIGNUP_STARTED = "המשמרת כבר התחילה";
export const SIGNUP_OVERLAP = "יש לך משמרת חופפת";

// Why a worker can't sign up to this shift, or null when signing up is allowed.
// Leaving a shift is never restricted, so this is only checked on sign up.
export function signupBlockedReason(
  shift: ShiftTimes,
  { now, blocks, events, myShifts }: SignupContext,
): string | null {
  const start: LocalDateTime = `${shift.date}T${shift.startTime}`;
  if (start <= now) return SIGNUP_STARTED;

  const event = events.find((e) => e.date === shift.date && e.closesSignup);
  if (event) return `ההרשמה סגורה ביום זה (${event.title})`;

  // A block closes only the shifts that START inside it.
  const block = blocks.find((b) => b.startAt <= start && start < b.endAt);
  if (block) {
    return block.reason
      ? `ההרשמה סגורה (${block.reason})`
      : "ההרשמה סגורה בשעות אלו";
  }

  const clash = myShifts.some(
    (mine) =>
      mine.id !== shift.id && mine.date === shift.date && overlaps(mine, shift),
  );
  if (clash) return SIGNUP_OVERLAP;

  return null;
}
