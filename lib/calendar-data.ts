import { visibleDays } from "@/lib/calendar";
import { blocks, events, shifts } from "@/lib/mongodb";

import type { CalendarData } from "@/lib/interfaces";
import type { LocalDate } from "@/lib/types";
import type { CalendarView } from "@/lib/types/calendar.type";

interface CalendarDataParams {
  view: CalendarView;
  date: LocalDate;
}

export async function getCalendarData({
  view,
  date,
}: CalendarDataParams): Promise<CalendarData> {
  const days = visibleDays(view, date);
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  const [shiftsCollection, blocksCollection, eventsCollection] =
    await Promise.all([shifts(), blocks(), events()]);

  const [shiftDocs, blockDocs, eventDocs] = await Promise.all([
    shiftsCollection
      .find({ date: { $gte: firstDay, $lte: lastDay } })
      .toArray(),
    // A block is visible if any part of it overlaps the visible days.
    blocksCollection
      .find({
        startAt: { $lte: `${lastDay}T23:59` },
        endAt: { $gt: `${firstDay}T00:00` },
      })
      .toArray(),
    eventsCollection
      .find({ date: { $gte: firstDay, $lte: lastDay } })
      .toArray(),
  ]);

  return {
    shifts: shiftDocs.map((doc) => ({
      id: doc._id.toString(),
      date: doc.date,
      startTime: doc.startTime,
      endTime: doc.endTime,
      label: doc.label,
      workerCount: doc.workerIds.length,
    })),
    blocks: blockDocs.map((doc) => ({
      id: doc._id.toString(),
      startAt: doc.startAt,
      endAt: doc.endAt,
      reason: doc.reason,
    })),
    events: eventDocs.map((doc) => ({
      id: doc._id.toString(),
      date: doc.date,
      title: doc.title,
      startTime: doc.startTime,
      closesSignup: doc.closesSignup,
    })),
  };
}
