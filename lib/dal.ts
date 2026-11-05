import { cache } from "react";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { users } from "@/lib/mongodb";
import { readSession } from "@/lib/session";
import type { User } from "@/lib/types";

// The cookie only proves who the user is; role and approval are always read from the DB.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await readSession();
  if (!session || !ObjectId.isValid(session.userId)) return null;
  const collection = await users();
  const user = await collection.findOne({
    _id: new ObjectId(session.userId),
  });
  return user?.status === "approved" ? user : null;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
