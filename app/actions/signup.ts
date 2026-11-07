"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import type { FormState } from "@/lib/interfaces";
import { SERVER_ERROR } from "@/lib/messages";
import { blocks, events, shifts } from "@/lib/mongodb";
import { signupBlockedReason } from "@/lib/signup";
import { nowInIsrael } from "@/lib/time";

const SHIFT_NOT_FOUND = "המשמרת לא נמצאה";

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/shifts");
}

export async function signUpForShift(shiftId: string): Promise<FormState> {
  const user = await requireUser();
  if (!ObjectId.isValid(shiftId)) return { message: SHIFT_NOT_FOUND };
  const _id = new ObjectId(shiftId);

  try {
    const [shiftsCollection, blocksCollection, eventsCollection] =
      await Promise.all([shifts(), blocks(), events()]);

    const shift = await shiftsCollection.findOne({ _id });
    if (!shift) return { message: SHIFT_NOT_FOUND };
    if (shift.workerIds.some((id) => id.equals(user._id))) {
      return { success: true };
    }

    const start = `${shift.date}T${shift.startTime}`;
    const [blockDocs, eventDocs, myShiftDocs] = await Promise.all([
      blocksCollection
        .find({ startAt: { $lte: start }, endAt: { $gt: start } })
        .toArray(),
      eventsCollection
        .find({ date: shift.date, closesSignup: true })
        .toArray(),
      shiftsCollection
        .find({ date: shift.date, workerIds: user._id })
        .toArray(),
    ]);

    const reason = signupBlockedReason(
      { id: shiftId, ...shift },
      {
        now: nowInIsrael(),
        blocks: blockDocs,
        events: eventDocs,
        myShifts: myShiftDocs.map((doc) => ({ id: doc._id.toString(), ...doc })),
      },
    );
    if (reason) return { message: reason };

    await shiftsCollection.updateOne(
      { _id },
      { $addToSet: { workerIds: user._id } },
    );
  } catch (error) {
    console.error("signUpForShift failed", error);
    return { message: SERVER_ERROR };
  }

  refresh();
  return { success: true };
}

// Leaving is allowed at any time, including past and closed shifts.
export async function leaveShift(shiftId: string): Promise<FormState> {
  const user = await requireUser();
  if (!ObjectId.isValid(shiftId)) return { message: SHIFT_NOT_FOUND };

  try {
    const collection = await shifts();
    await collection.updateOne(
      { _id: new ObjectId(shiftId) },
      { $pull: { workerIds: user._id } },
    );
  } catch (error) {
    console.error("leaveShift failed", error);
    return { message: SERVER_ERROR };
  }

  refresh();
  return { success: true };
}
