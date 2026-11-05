import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";

// A valid user is sent home; a stale cookie (deleted/rejected user) just sees the form.
async function RedirectIfSignedIn() {
  if (await getCurrentUser()) redirect("/");
  return null;
}

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-col flex-1 items-center justify-center p-4">
      {children}
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
    </main>
  );
}
