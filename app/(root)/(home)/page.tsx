import { Suspense } from "react";
import { requireUser } from "@/lib/dal";


// Component here for the suspense boundary
async function Greeting() {
  const user = await requireUser();
  return <p>שלום {user.name}</p>;
}

export default function HomePage() {
  return (
    <Suspense fallback={<p>טוען...</p>}>
      <Greeting />
    </Suspense>
  );
}
