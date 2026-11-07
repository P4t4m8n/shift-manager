"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { field } from "@/lib/form";
import type { ShiftFormState } from "@/lib/interfaces";
import { SERVER_ERROR } from "@/lib/messages";
import { shifts } from "@/lib/mongodb";
import {
  MAX_REPEAT_WEEKS,
  echoValues,
  overlaps,
  parseShiftFields,
} from "@/lib/shifts";
import {
  addDays,
  formatDayMonth,
  isValidDate,
  startOfWeek,
} from "@/lib/time";

// Create the same shift on several days of a week, optionally repeated for N weeks.
export async function createShifts(
  _prev: ShiftFormState,
  formData: FormData,
): Promise<ShiftFormState> {
  await requireAdmin();
  const values = echoValues(formData);

  const weekStart = field(formData, "weekStart");
  const parsed = parseShiftFields(formData);
  const days = [...new Set(formData.getAll("days").map(Number))]
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b);
  const repeatWeeks = Number(field(formData, "repeatWeeks") || 1);

  if (!isValidDate(weekStart)) return { message: "תאריך לא תקין", values };
  if ("error" in parsed) return { message: parsed.error, values };
  if (days.length === 0) {
    return { message: "יש לבחור לפחות יום אחד", values };
  }
  if (
    !Number.isInteger(repeatWeeks) ||
    repeatWeeks < 1 ||
    repeatWeeks > MAX_REPEAT_WEEKS
  ) {
    return {
      message: `מספר השבועות חייב להיות בין 1 ל-${MAX_REPEAT_WEEKS}`,
      values,
    };
  }

  const firstDay = startOfWeek(weekStart);
  const dates = Array.from({ length: repeatWeeks }, (_, week) =>
    days.map((day) => addDays(firstDay, week * 7 + day)),
  ).flat();

  try {
    const collection = await shifts();

    if (formData.get("force") !== "1") {
      const existing = await collection.find({ date: { $in: dates } }).toArray();
      const clashes = dates.filter((date) =>
        existing.some((s) => s.date === date && overlaps(s, parsed.data)),
      );
      if (clashes.length > 0) {
        return {
          message: `קיימות משמרות חופפות בתאריכים: ${clashes.map(formatDayMonth).join(", ")}`,
          needsConfirm: true,
          values,
        };
      }
    }

    await collection.insertMany(
      dates.map((date) => ({
        date,
        ...parsed.data,
        workerIds: [],
        createdAt: new Date(),
      })),
    );
  } catch (error) {
    console.error("createShifts failed", error);
    return { message: SERVER_ERROR, values };
  }

  revalidatePath("/admin/shifts");
  return { success: true };
}

export async function updateShift(
  shiftId: string,
  _prev: ShiftFormState,
  formData: FormData,
): Promise<ShiftFormState> {
  await requireAdmin();
  const values = echoValues(formData);

  const date = field(formData, "date");
  const parsed = parseShiftFields(formData);

  if (!ObjectId.isValid(shiftId)) return { message: "המשמרת לא נמצאה", values };
  if (!isValidDate(date)) return { message: "תאריך לא תקין", values };
  if ("error" in parsed) return { message: parsed.error, values };

  const _id = new ObjectId(shiftId);
  const { label, ...times } = parsed.data;

  try {
    const collection = await shifts();

    if (formData.get("force") !== "1") {
      const sameDay = await collection
        .find({ date, _id: { $ne: _id } })
        .toArray();
      const clashes = sameDay.filter((s) => overlaps(s, parsed.data));
      if (clashes.length > 0) {
        return {
          message: `קיימת משמרת חופפת ב-${formatDayMonth(date)}`,
          needsConfirm: true,
          values,
        };
      }
    }

    const result = await collection.updateOne(
      { _id },
      {
        $set: { date, ...times, ...(label ? { label } : {}) },
        ...(label ? {} : { $unset: { label: "" } }),
      },
    );
    if (result.matchedCount === 0) {
      return { message: "המשמרת לא נמצאה", values };
    }
  } catch (error) {
    console.error("updateShift failed", error);
    return { message: SERVER_ERROR, values };
  }

  revalidatePath("/admin/shifts");
  return { success: true };
}

export async function deleteShift(shiftId: string) {
  await requireAdmin();
  if (!ObjectId.isValid(shiftId)) return;

  const collection = await shifts();
  await collection.deleteOne({ _id: new ObjectId(shiftId) });
  revalidatePath("/admin/shifts");
}
