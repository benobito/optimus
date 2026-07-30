import { NextResponse } from "next/server";

// Note: full HMAC verification happens in lib/auth.js on the server routes;
// here we only do a cheap presence check to redirect unauthenticated users
// away from the admin UI before it even loads.
export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = request.cookies.get("gemdrop_admin");
    if (!cookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
