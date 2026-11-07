import { Suspense } from "react";
import { AdminCalendarContent } from "@/app/ui/admin/calendar-content";

export default function ShiftsPage({
  searchParams,
}: PageProps<"/admin/shifts">) {
  return (
    <>
      <h1 className="text-2xl font-bold">משמרות</h1>
      <Suspense fallback={<p>טוען...</p>}>
        <AdminCalendarContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
