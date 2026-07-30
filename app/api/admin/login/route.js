import { NextResponse } from "next/server";
import { checkAdminPassword, makeSessionToken, ADMIN_COOKIE } from "@/lib/auth";

export async function POST(request) {
  const { password } = await request.json();
  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "ពាក្យសម្ងាត់មិនត្រឹមត្រូវ" }, { status: 401 });
  }
  const token = makeSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
