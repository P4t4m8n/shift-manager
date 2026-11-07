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

export interface ShiftFormState {
  message?: string;
  success?: boolean;
  needsConfirm?: boolean; // overlapping shifts found; user may resubmit with force
  values?: ShiftFormValues;
}

// Plain, serializable shift passed from server components to the calendar.
export interface CalendarShift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  label?: string;
  workerCount: number;
}