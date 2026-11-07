import {
  approveUser,
  demoteUser,
  promoteUser,
  rejectUser,
  unlockUser,
} from "@/app/actions/users";
import { ActionButton } from "@/app/ui/admin/action-button";

import { formatPhone } from "@/lib/phone";

import type { User, UserStatus } from "@/lib/types";

const STATUS_LABEL: Record<UserStatus, string> = {
  pending: "ממתין לאישור",
  approved: "מאושר",
  rejected: "נדחה",
};

interface UserListItemProps {
  user: User;
  admin: User;
  now: Date;
}

export default function UserListItem({ user, admin, now }: UserListItemProps) {
  const { name, phone, status, role, lockedUntil, _id } = user;
  const id = _id.toString();
  const isSelf = id === admin._id.toString();
  const isLocked = !!lockedUntil && lockedUntil > now;

  return (
    <li
      key={id}
      className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 p-3"
    >
      <UserListItemInfo
        name={name}
        phone={phone}
        status={status}
        role={role}
        isSelf={isSelf}
        isLocked={isLocked}
      />

      <UserListItemActions
        isSelf={isSelf}
        status={status}
        role={role}
        id={id}
        isLocked={isLocked}
      />
    </li>
  );
}

interface UserListItemInfoProps {
  name: string;
  phone: string;
  status: UserStatus;
  role: "admin" | "worker";
  isSelf: boolean;
  isLocked: boolean;
}

const UserListItemInfo = ({
  name,
  phone,
  status,
  role,
  isSelf,
  isLocked,
}: UserListItemInfoProps) => {
  return (
    <div className="flex flex-col">
      <span className="font-bold">
        {name}
        {isSelf && " (אני)"}
      </span>
      <span className="text-sm" dir="ltr">
        {formatPhone(phone)}
      </span>
      <span className="text-sm text-gray-500">
        {role === "admin" ? "מנהל" : "עובד"} · {STATUS_LABEL[status]}
        {isLocked && " · נעול"}
      </span>
    </div>
  );
};

interface UserListItemActionsProps {
  isSelf: boolean;
  status: UserStatus;
  role: "admin" | "worker";
  id: string;
  isLocked: boolean;
}

const UserListItemActions = ({
  isSelf,
  status,
  role,
  id,
  isLocked,
}: UserListItemActionsProps) => {
  if (isSelf) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "approved" && (
        <ActionButton action={approveUser.bind(null, id)}>
          {status === "pending" ? "אישור" : "אישור מחדש"}
        </ActionButton>
      )}
      {status === "pending" && (
        <ActionButton action={rejectUser.bind(null, id)}>דחייה</ActionButton>
      )}
      {status === "approved" && role === "worker" && (
        <>
          <ActionButton action={promoteUser.bind(null, id)}>
            הפיכה למנהל
          </ActionButton>
          <ActionButton action={rejectUser.bind(null, id)}>חסימה</ActionButton>
        </>
      )}
      {role === "admin" && (
        <ActionButton action={demoteUser.bind(null, id)}>
          הפיכה לעובד
        </ActionButton>
      )}
      {status === "approved" && isLocked && (
        <ActionButton action={unlockUser.bind(null, id)}>
          שחרור נעילה
        </ActionButton>
      )}
    </div>
  );
};
