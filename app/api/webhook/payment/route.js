import { NextResponse } from "next/server";
import { verifyPaymentWebhook } from "@/lib/payment";

// Your payment gateway (ABA PayWay / Bakong / Wing) will call this URL
// when a payment succeeds. See lib/payment.js for what to fill in.
export async function POST(request) {
  try {
    await verifyPaymentWebhook(request);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 501 });
  }
}
