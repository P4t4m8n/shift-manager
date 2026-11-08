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
    <main className="flex flex-col flex-1 items-center justify-center ">
      <div className="flex flex-col gap-4 w-full max-w-xs border rounded p-4">
        {children}
      </div>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
    </main>
  );
}
