import { AdminShiftCalendar } from "@/app/ui/admin/admin-shift-calendar";
import { parseDate, parseView, visibleDays } from "@/lib/calendar";
import { requireAdmin } from "@/lib/dal";
import { shifts } from "@/lib/mongodb";
import { todayInIsrael } from "@/lib/time";

// Reads cookies/search params/DB/clock, so the page must render it inside <Suspense>.
export async function AdminCalendarContent({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[]; date?: string | string[] }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const view = parseView(params.view);
  const date = parseDate(params.date);

  const days = visibleDays(view, date);
  const collection = await shifts();
  const docs = await collection
    .find({ date: { $gte: days[0], $lte: days[days.length - 1] } })
    .toArray();

  return (
    <AdminShiftCalendar
      view={view}
      date={date}
      today={todayInIsrael()}
      shifts={docs.map((doc) => ({
        id: doc._id.toString(),
        date: doc.date,
        startTime: doc.startTime,
        endTime: doc.endTime,
        label: doc.label,
        workerCount: doc.workerIds.length,
      }))}
    />
  );
}
