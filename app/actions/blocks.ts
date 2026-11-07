"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { echoBlockValues, parseBlockFields } from "@/lib/blocks";
import { requireAdmin } from "@/lib/dal";
import type { BlockFormState } from "@/lib/interfaces";
import { SERVER_ERROR } from "@/lib/messages";
import { blocks } from "@/lib/mongodb";
import { REPEAT_WEEKS_ERROR, parseRepeatWeeks } from "@/lib/repeat";
import { addDaysToDateTime } from "@/lib/time";

// Closes signup for a time range; optionally repeated weekly for N weeks.
export async function createBlocks(
  _prev: BlockFormState,
  formData: FormData,
): Promise<BlockFormState> {
  await requireAdmin();
  const values = echoBlockValues(formData);

  const parsed = parseBlockFields(formData);
  const repeatWeeks = parseRepeatWeeks(formData);

  if ("error" in parsed) return { message: parsed.error, values };
  if (repeatWeeks === null) return { message: REPEAT_WEEKS_ERROR, values };

  const { startAt, endAt, reason } = parsed.data;

  try {
    const collection = await blocks();
    await collection.insertMany(
      Array.from({ length: repeatWeeks }, (_, week) => ({
        startAt: addDaysToDateTime(startAt, week * 7),
        endAt: addDaysToDateTime(endAt, week * 7),
        ...(reason ? { reason } : {}),
        createdAt: new Date(),
      })),
    );
  } catch (error) {
    console.error("createBlocks failed", error);
    return { message: SERVER_ERROR, values };
  }

  revalidatePath("/admin/shifts");
  return { success: true };
}

export async function updateBlock(
  blockId: string,
  _prev: BlockFormState,
  formData: FormData,
): Promise<BlockFormState> {
  await requireAdmin();
  const values = echoBlockValues(formData);

  const parsed = parseBlockFields(formData);

  if (!ObjectId.isValid(blockId)) return { message: "החסימה לא נמצאה", values };
  if ("error" in parsed) return { message: parsed.error, values };

  const { reason, ...range } = parsed.data;

  try {
    const collection = await blocks();
    const result = await collection.updateOne(
      { _id: new ObjectId(blockId) },
      {
        $set: { ...range, ...(reason ? { reason } : {}) },
        ...(reason ? {} : { $unset: { reason: "" } }),
      },
    );
    if (result.matchedCount === 0) {
      return { message: "החסימה לא נמצאה", values };
    }
  } catch (error) {
    console.error("updateBlock failed", error);
    return { message: SERVER_ERROR, values };
  }

  revalidatePath("/admin/shifts");
  return { success: true };
}

export async function deleteBlock(blockId: string) {
  await requireAdmin();
  if (!ObjectId.isValid(blockId)) return;

  const collection = await blocks();
  await collection.deleteOne({ _id: new ObjectId(blockId) });
  revalidatePath("/admin/shifts");
}
