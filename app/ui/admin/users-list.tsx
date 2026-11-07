import { requireAdmin } from "@/lib/dal";
import { users } from "@/lib/mongodb";

import UserListItem from "./UserListItem";

import type { UserStatus } from "@/lib/types";

const STATUS_ORDER: Record<UserStatus, number> = {
  pending: 0,
  approved: 1,
  rejected: 2,
};

// Reads cookies/DB, so the page must render it inside <Suspense>.
export async function UsersList() {
  const admin = await requireAdmin();
  const collection = await users();
  const all = await collection.find().sort({ name: 1 }).toArray();
  const list = all.sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );
  const now = new Date();

  return (
    <ul className="flex flex-col gap-3">
      {list.map((user) => {
        return (
          <UserListItem
            key={user._id.toString()}
            user={user}
            admin={admin}
            now={now}
          />
        );
      })}
    </ul>
  );
}
