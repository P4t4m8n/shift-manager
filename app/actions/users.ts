"use server";

import { ObjectId } from "mongodb";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { users } from "@/lib/mongodb";

import type { Filter, UpdateFilter } from "mongodb";
import type { NewDoc, User } from "@/lib/types";

type UserDoc = NewDoc<User>;

// Every action re-checks admin rights (proxy alone isn't enough for Server Actions).
// Admins can't change themselves, so the last admin can never lock everyone out.
// The extra filter makes each action valid only from the expected state.

const updateUser = async (
  userId: string,
  onlyIf: Filter<UserDoc>,
  update: UpdateFilter<UserDoc>,
) => {
  const admin = await requireAdmin();
  if (!ObjectId.isValid(userId) || admin._id.toString() === userId) return;

  const collection = await users();
  await collection.updateOne({ ...onlyIf, _id: new ObjectId(userId) }, update);
  revalidatePath("/admin/users");
};

export const approveUser = async (userId: string) => {
  await updateUser(
    userId,
    { status: { $in: ["pending", "rejected"] } },
    { $set: { status: "approved" } },
  );
};

export const rejectUser = async (userId: string) => {
  await updateUser(
    userId,
    { role: "worker", status: { $in: ["pending", "approved"] } },
    { $set: { status: "rejected" } },
  );
};

export const promoteUser = async (userId: string) => {
  await updateUser(
    userId,
    { role: "worker", status: "approved" },
    { $set: { role: "admin" } },
  );
};

export const demoteUser = async (userId: string) => {
  await updateUser(userId, { role: "admin" }, { $set: { role: "worker" } });
};

export const unlockUser = async (userId: string) => {
  await updateUser(
    userId,
    {},
    { $set: { failedPinAttempts: 0 }, $unset: { lockedUntil: "" } },
  );
};
