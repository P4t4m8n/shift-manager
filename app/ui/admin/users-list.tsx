import {
  approveUser,
  demoteUser,
  promoteUser,
  rejectUser,
  unlockUser,
} from "@/app/actions/users";
import { ActionButton } from "@/app/ui/admin/action-button";
import { requireAdmin } from "@/lib/dal";
import { users } from "@/lib/mongodb";
import { formatPhone } from "@/lib/phone";
import type { UserStatus } from "@/lib/types";

const STATUS_LABEL: Record<UserStatus, string> = {
  pending: "ממתין לאישור",
  approved: "מאושר",
  rejected: "נדחה",
};

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
        const id = user._id.toString();
        const isSelf = id === admin._id.toString();
        const isLocked = !!user.lockedUntil && user.lockedUntil > now;

        return (
          <li
            key={id}
            className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 p-3"
          >
            <div className="flex flex-col">
              <span className="font-bold">
                {user.name}
                {isSelf && " (אני)"}
              </span>
              <span className="text-sm" dir="ltr">
                {formatPhone(user.phone)}
              </span>
              <span className="text-sm text-gray-500">
                {user.role === "admin" ? "מנהל" : "עובד"} ·{" "}
                {STATUS_LABEL[user.status]}
                {isLocked && " · נעול"}
              </span>
            </div>

            {!isSelf && (
              <div className="flex flex-wrap gap-2">
                {user.status !== "approved" && (
                  <ActionButton action={approveUser.bind(null, id)}>
                    {user.status === "pending" ? "אישור" : "אישור מחדש"}
                  </ActionButton>
                )}
                {user.status === "pending" && (
                  <ActionButton action={rejectUser.bind(null, id)}>
                    דחייה
                  </ActionButton>
                )}
                {user.status === "approved" && user.role === "worker" && (
                  <>
                    <ActionButton action={promoteUser.bind(null, id)}>
                      הפיכה למנהל
                    </ActionButton>
                    <ActionButton action={rejectUser.bind(null, id)}>
                      חסימה
                    </ActionButton>
                  </>
                )}
                {user.role === "admin" && (
                  <ActionButton action={demoteUser.bind(null, id)}>
                    הפיכה לעובד
                  </ActionButton>
                )}
                {isLocked && (
                  <ActionButton action={unlockUser.bind(null, id)}>
                    שחרור נעילה
                  </ActionButton>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
