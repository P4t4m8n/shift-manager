import { Suspense } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { requireUser } from "@/lib/dal";

//User menu sit here becouse of suspense boundary
async function UserMenu() {
  const user = await requireUser();
  return (
    <div className="flex items-center gap-3 text-sm">
      {user.role === "admin" && <Link href="/admin">ניהול</Link>}
      <span>{user.name}</span>
      <form action={logout}>
        <button type="submit" className="underline">
          התנתקות
        </button>
      </form>
    </div>
  );
}

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <span className="font-bold">ניהול משמרות</span>
        <Suspense fallback={null}>
          <UserMenu />
        </Suspense>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </>
  );
}
