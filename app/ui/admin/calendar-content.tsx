import { AdminShiftCalendar } from "@/app/ui/admin/admin-shift-calendar";
import { parseDate, parseView, visibleDays } from "@/lib/calendar";
import { requireAdmin } from "@/lib/dal";
import { blocks, events, shifts } from "@/lib/mongodb";
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

  const days = visibleDays(view, date);
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  const [shiftsCollection, blocksCollection, eventsCollection] =
    await Promise.all([shifts(), blocks(), events()]);

  const [shiftDocs, blockDocs, eventDocs] = await Promise.all([
    shiftsCollection.find({ date: { $gte: firstDay, $lte: lastDay } }).toArray(),
    // A block is visible if any part of it overlaps the visible days.
    blocksCollection
      .find({
        startAt: { $lte: `${lastDay}T23:59` },
        endAt: { $gt: `${firstDay}T00:00` },
      })
      .toArray(),
    eventsCollection.find({ date: { $gte: firstDay, $lte: lastDay } }).toArray(),
  ]);

  return (
    <AdminShiftCalendar
      view={view}
      date={date}
      today={todayInIsrael()}
      shifts={shiftDocs.map((doc) => ({
        id: doc._id.toString(),
        date: doc.date,
        startTime: doc.startTime,
        endTime: doc.endTime,
        label: doc.label,
        workerCount: doc.workerIds.length,
      }))}
      blocks={blockDocs.map((doc) => ({
        id: doc._id.toString(),
        startAt: doc.startAt,
        endAt: doc.endAt,
        reason: doc.reason,
      }))}
      events={eventDocs.map((doc) => ({
        id: doc._id.toString(),
        date: doc.date,
        title: doc.title,
        startTime: doc.startTime,
        closesSignup: doc.closesSignup,
      }))}
    />
  );
}
