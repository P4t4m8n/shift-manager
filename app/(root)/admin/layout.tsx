import Link from "next/link";

// Access is enforced by the proxy (optimistic) and requireAdmin() in each page/action.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-col gap-4">
      <nav className="flex gap-4 border-b border-gray-200 pb-2 text-sm">
        <Link href="/admin/users">משתמשים</Link>
        <Link href="/admin/shifts">משמרות</Link>
      </nav>
      {children}
    </div>
  );
}
