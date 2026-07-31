import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Public settings only — never expose ADMIN_PASSWORD/SESSION_SECRET etc.
// Used by the storefront footer to show contact links (Telegram, Facebook,
// email...). Edit the values in data/db.json -> settings, or wire this up
// to an admin settings form later.
export async function GET() {
  const db = await getDb();
  const s = db.data.settings || {};
  return NextResponse.json({
    settings: {
      shopName: s.shopName || "OPTIMUS",
      supportTelegram: s.supportTelegram || "",
      supportFacebook: s.supportFacebook || "",
      supportEmail: s.supportEmail || "",
      supportPhone: s.supportPhone || "",
    },
  });
}
