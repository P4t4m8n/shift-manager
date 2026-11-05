import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, decrypt } from "@/lib/session";

const publicRoutes = ["/login", "/register"];

// Optimistic check only (cookie signature + role). Real authorization happens in lib/dal.ts.
export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = publicRoutes.includes(path);

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (path.startsWith("/admin") && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
