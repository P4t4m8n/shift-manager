import { Suspense } from "react";
import { UsersList } from "@/app/ui/admin/users-list";

export default function UsersPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">משתמשים</h1>
      <Suspense fallback={<p>טוען...</p>}>
        <UsersList />
      </Suspense>
    </>
  );
}
