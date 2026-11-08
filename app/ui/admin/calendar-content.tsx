import { AdminShiftCalendar } from "@/app/ui/admin/admin-shift-calendar";
import { parseDate, parseView } from "@/lib/calendar";
import { getCalendarData } from "@/lib/calendar-data";
import { requireAdmin } from "@/lib/dal";
import { todayInIsrael } from "@/lib/time";

// Reads cookies/search params/DB/clock, so the page must render it inside <Suspense>.
interface AdminCalendarContentProps {
  searchParams: Promise<{ view?: string | string[]; date?: string | string[] }>;
}

export async function AdminCalendarContent({
  searchParams,
}: AdminCalendarContentProps) {
  await requireAdmin();
  const params = await searchParams;
  const view = parseView(params.view);
  const date = parseDate(params.date);

  const { shifts, blocks, events } = await getCalendarData({ view, date });

  return (
    <AdminShiftCalendar
      view={view}
      date={date}
      today={todayInIsrael()}
      shifts={shifts}
      blocks={blocks}
      events={events}
    />
  );
}
