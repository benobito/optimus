/**
 * PAYMENT INTEGRATION
 * ===================
 * This file is where you connect a REAL payment gateway. Right now it runs
 * in "manual confirm" mode: the customer sees your KHQR / bank details and
 * the order sits as "pending_payment" until an admin marks it paid in the
 * dashboard. That already works for a real shop run by hand.
 *
 * To make it fully automatic, pick ONE of the options below and fill in
 * createPaymentRequest() + verifyPaymentWebhook().
 *
 * OPTION A — ABA PayWay
 *   Docs: https://pay.ababank.com  (merchant account required)
 *   You get: merchant_id, api_key. You POST to their `purchase` endpoint
 *   with an HMAC-SHA512 signature, they redirect back / call your webhook.
 *
 * OPTION B — Bakong KHQR (NBC)
 *   Docs: https://bakong.nbc.gov.kh  (register as a merchant, get a Bakong
 *   Account ID). You generate a KHQR string + MD5 hash per transaction and
 *   poll Bakong's "check transaction by MD5" endpoint, or receive a webhook.
 *
 * OPTION C — Wing Business API
 *   Requires a Wing merchant agreement; they give you API credentials
 *   directly after onboarding.
 *
 * Whichever you pick, put the secret keys in `.env.local`
 * (ABA_API_KEY=..., BAKONG_API_KEY=..., etc) — never hardcode them here.
 */

// Static ABA KHQR details (manual-confirm mode). This is a fixed, personal
// QR — every customer scans the same image and the admin confirms payment
// by hand in the admin dashboard. Replace the image + numbers with your own, or swap
// this whole block out once you wire up OPTION A/B/C above for automatic
// per-order QR codes and confirmation.
export const ABA_PAYMENT = {
  payeeName: "SOPHAL SOK",
  accountKhr: "010 075 894",
  accountUsd: "010 075 893",
  qrImageUrl: "/images/aba-khqr.jpg",
};

export async function createPaymentRequest(order) {
  // TODO: replace with a real call to your chosen gateway.
  // Example shape once wired up:
  //   const qr = await abaGenerateQr({ amount: order.totalUsd, tx_id: order.id });
  //   return { method: "ABA", qrImageUrl: qr.qrImage, deepLink: qr.abapayDeeplink };
  return {
    method: "manual",
    instructions:
      "ស្កេន KHQR ឬផ្ទេរប្រាក់តាមលេខគណនីខាងក្រោម រួចផ្ញើ Screenshot ទៅ Telegram/Admin ដើម្បីបញ្ជាក់។",
    ...ABA_PAYMENT,
  };
}

export async function verifyPaymentWebhook(request) {
  // TODO: verify the signature the gateway sends you, look up the order by
  // its transaction id, and mark it "paid". Then call deliverDiamonds()
  // from lib/supplier.js so the order fulfills automatically.
  throw new Error("verifyPaymentWebhook() not implemented yet — see lib/payment.js");
}
