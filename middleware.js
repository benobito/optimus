import { NextResponse } from "next/server";

// Note: full HMAC verification happens in lib/auth.js on the server routes;
// here we only do a cheap presence check to redirect unauthenticated users
// away from the admin UI before it even loads.
//
// The admin dashboard intentionally does NOT live at the obvious "/admin"
// path (and isn't linked from anywhere on the public storefront) so random
// visitors can't stumble onto the login screen. Bookmark this URL — see
// README.md section "Admin access" for details, and change it to your own
// secret slug before going live.
const ADMIN_BASE = "/staff-7q2f9k";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith(ADMIN_BASE) && pathname !== `${ADMIN_BASE}/login`) {
    const cookie = request.cookies.get("gemdrop_admin");
    if (!cookie) {
      return NextResponse.redirect(new URL(`${ADMIN_BASE}/login`, request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/staff-7q2f9k/:path*"],
};
