import { WorkerCalendarContent } from "@/app/ui/worker/worker-calendar-content";
import { requireUser } from "@/lib/dal";

interface HomeContentProps {
  searchParams: Promise<{ view?: string | string[]; date?: string | string[] }>;
}

// Reads cookies, so the page must render it inside <Suspense>.
// Workers get the signup calendar; admins keep the greeting and use /admin.
export async function HomeContent({ searchParams }: HomeContentProps) {
  const user = await requireUser();
  if (user.role === "admin") return <p>שלום {user.name}</p>;

  return <WorkerCalendarContent user={user} searchParams={searchParams} />;
}
