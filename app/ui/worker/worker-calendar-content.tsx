import { WorkerCalendar } from "@/app/ui/worker/worker-calendar";
import { parseDate, parseView, visibleDays } from "@/lib/calendar";
import { blocks, events, shifts, users } from "@/lib/mongodb";
import { signupBlockedReason } from "@/lib/signup";
import { nowInIsrael, todayInIsrael } from "@/lib/time";
import type { User } from "@/lib/types";

interface WorkerCalendarContentProps {
  user: User;
  searchParams: Promise<{ view?: string | string[]; date?: string | string[] }>;
}

// Reads search params/DB/clock, so the page must render it inside <Suspense>.
export async function WorkerCalendarContent({
  user,
  searchParams,
}: WorkerCalendarContentProps) {
  const params = await searchParams;
  const view = parseView(params.view);
  const date = parseDate(params.date);

  const days = visibleDays(view, date);
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  const [shiftsCollection, blocksCollection, eventsCollection, usersCollection] =
    await Promise.all([shifts(), blocks(), events(), users()]);

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

  // Workers see names (never phones), and only of approved accounts.
  const workerIds = shiftDocs.flatMap((doc) => doc.workerIds);
  const people = await usersCollection
    .find(
      { _id: { $in: workerIds }, status: "approved" },
      { projection: { name: 1 } },
    )
    .toArray();
  const nameById = new Map(
    people.map((person) => [person._id.toString(), person.name]),
  );

  const isMine = (workerIds: { equals(id: unknown): boolean }[]) =>
    workerIds.some((id) => id.equals(user._id));

  const myShifts = shiftDocs
    .filter((doc) => isMine(doc.workerIds))
    .map((doc) => ({
      id: doc._id.toString(),
      date: doc.date,
      startTime: doc.startTime,
      endTime: doc.endTime,
    }));
  const context = {
    now: nowInIsrael(),
    blocks: blockDocs,
    events: eventDocs,
    myShifts,
  };

  return (
    <WorkerCalendar
      view={view}
      date={date}
      today={todayInIsrael()}
      shifts={shiftDocs.map((doc) => {
        const id = doc._id.toString();
        const signedUp = isMine(doc.workerIds);
        const workers = doc.workerIds
          .map((workerId) => nameById.get(workerId.toString()))
          .filter((name): name is string => !!name);

        return {
          id,
          date: doc.date,
          startTime: doc.startTime,
          endTime: doc.endTime,
          label: doc.label,
          workerCount: workers.length,
          workers,
          signedUp,
          blockedReason: signedUp
            ? undefined
            : (signupBlockedReason({ id, ...doc }, context) ?? undefined),
        };
      })}
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
