import type { ObjectId } from "mongodb";

// Local strings in workplace time:
//   LocalDate     "YYYY-MM-DD"
//   LocalTime     "HH:mm"
//   LocalDateTime "YYYY-MM-DDTHH:mm"  (sorts correctly as a plain string)
export type LocalDate = string;
export type LocalTime = string;
export type LocalDateTime = string;

export type UserRole = "worker" | "admin";
export type UserStatus = "pending" | "approved" | "rejected";

export interface User {
  _id: ObjectId;
  phone: string; // normalized, unique
  name: string;
  pinHash: string;
  role: UserRole;
  status: UserStatus;
  failedPinAttempts: number;
  lockedUntil?: Date; // login blocked until this time after too many wrong PINs
  createdAt: Date;
}


export interface Shift {
  _id: ObjectId;
  date: LocalDate;
  startTime: LocalTime;
  endTime: LocalTime;
  label?: string;
  workerIds: ObjectId[];
  createdAt: Date;
}

// Workers can't sign up inside [startAt, endAt]. Admins can still edit.
export interface Block {
  _id: ObjectId;
  startAt: LocalDateTime;
  endAt: LocalDateTime;
  reason?: string;
  createdAt: Date;
}

export interface ScheduleEvent {
  _id: ObjectId;
  date: LocalDate;
  title: string;
  startTime?: LocalTime;
  closesSignup: boolean; // when true, workers can't sign up to shifts on this date
  createdAt: Date;
}

// Inserts don't carry an _id; reads still return it (WithId).
export type NewDoc<T> = Omit<T, "_id">;