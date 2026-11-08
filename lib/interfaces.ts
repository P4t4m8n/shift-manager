export interface FormState {
  message?: string;
  success?: boolean;
}

export interface ShiftFormValues {
  date?: string;
  startTime?: string;
  endTime?: string;
  label?: string;
  repeatWeeks?: string;
  days?: string[];
}

export interface BlockFormValues {
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  reason?: string;
  repeatWeeks?: string;
}

export interface EventFormValues {
  date?: string;
  title?: string;
  startTime?: string;
  closesSignup?: string; // "1" when checked
  repeatWeeks?: string;
  days?: string[];
}

export interface FormResult<Values> {
  message?: string;
  success?: boolean;
  needsConfirm?: boolean; // overlapping shifts found; user may resubmit with force
  values?: Values;
}

export type ShiftFormState = FormResult<ShiftFormValues>;
export type BlockFormState = FormResult<BlockFormValues>;
export type EventFormState = FormResult<EventFormValues>;

// Plain, serializable shift passed from server components to the calendar.
export interface CalendarShift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  label?: string;
  workerCount: number;
  // Only filled for the worker calendar:
  workers?: string[]; // names of everyone signed up
  signedUp?: boolean; // the current worker is signed up
  blockedReason?: string; // why the current worker can't sign up
}

export interface CalendarBlock {
  id: string;
  startAt: string; // "YYYY-MM-DDTHH:mm"
  endAt: string;
  reason?: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  startTime?: string;
  closesSignup: boolean;
}

export interface CalendarData {
  shifts: CalendarShift[];
  blocks: CalendarBlock[];
  events: CalendarEvent[];
}
