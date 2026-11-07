"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { echoEventValues, parseEventFields } from "@/lib/events";
import { field } from "@/lib/form";
import type { EventFormState } from "@/lib/interfaces";
import { SERVER_ERROR } from "@/lib/messages";
import { events } from "@/lib/mongodb";
import {
  REPEAT_WEEKS_ERROR,
  expandDates,
  parseRepeatWeeks,
  parseWeekDays,
} from "@/lib/repeat";
import { isValidDate } from "@/lib/time";

// Create the same event on several days of a week, optionally repeated for N weeks.
export async function createEvents(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireAdmin();
  const values = echoEventValues(formData);

  const weekStart = field(formData, "weekStart");
  const parsed = parseEventFields(formData);
  const days = parseWeekDays(formData);
  const repeatWeeks = parseRepeatWeeks(formData);

  if (!isValidDate(weekStart)) return { message: "תאריך לא תקין", values };
  if ("error" in parsed) return { message: parsed.error, values };
  if (days.length === 0) {
    return { message: "יש לבחור לפחות יום אחד", values };
  }
  if (repeatWeeks === null) return { message: REPEAT_WEEKS_ERROR, values };

  try {
    const collection = await events();
    await collection.insertMany(
      expandDates(weekStart, days, repeatWeeks).map((date) => ({
        date,
        ...parsed.data,
        createdAt: new Date(),
      })),
    );
  } catch (error) {
    console.error("createEvents failed", error);
    return { message: SERVER_ERROR, values };
  }

  revalidatePath("/admin/shifts");
  return { success: true };
}

export async function updateEvent(
  eventId: string,
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireAdmin();
  const values = echoEventValues(formData);

  const date = field(formData, "date");
  const parsed = parseEventFields(formData);

  if (!ObjectId.isValid(eventId)) return { message: "האירוע לא נמצא", values };
  if (!isValidDate(date)) return { message: "תאריך לא תקין", values };
  if ("error" in parsed) return { message: parsed.error, values };

  const { startTime, ...rest } = parsed.data;

  try {
    const collection = await events();
    const result = await collection.updateOne(
      { _id: new ObjectId(eventId) },
      {
        $set: { date, ...rest, ...(startTime ? { startTime } : {}) },
        ...(startTime ? {} : { $unset: { startTime: "" } }),
      },
    );
    if (result.matchedCount === 0) {
      return { message: "האירוע לא נמצא", values };
    }
  } catch (error) {
    console.error("updateEvent failed", error);
    return { message: SERVER_ERROR, values };
  }

  revalidatePath("/admin/shifts");
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  await requireAdmin();
  if (!ObjectId.isValid(eventId)) return;

  const collection = await events();
  await collection.deleteOne({ _id: new ObjectId(eventId) });
  revalidatePath("/admin/shifts");
}
