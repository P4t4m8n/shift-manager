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