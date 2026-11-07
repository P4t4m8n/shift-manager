import { Suspense } from "react";
import { HomeContent } from "@/app/ui/home-content";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<p>טוען...</p>}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}
