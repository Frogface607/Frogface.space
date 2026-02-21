import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const authEnabled = !!process.env.ADMIN_PASSWORD && !!process.env.SESSION_SECRET;

  if (!authEnabled) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("ff_session")?.value;
  if (token === process.env.SESSION_SECRET) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
