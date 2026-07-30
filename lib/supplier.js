/**
 * SUPPLIER / RESELLER INTEGRATION
 * ===============================
 * This is where diamonds actually get delivered to the player's game
 * account once an order is paid. You need a supplier account first —
 * common options resellers in Cambodia/SEA use:
 *   - Smile One (smile.one) reseller API
 *   - UniPin B2B API
 *   - A Telegram-bot supplier that exposes an HTTP API
 * Each gives you a base URL, an API key/secret, and an endpoint like
 * `POST /order` that takes { productId, userId, serverId, qty }.
 *
 * Fill in deliverDiamonds() below with your real supplier's request/response
 * shape. Until you do, orders will stay in "paid_awaiting_fulfillment" and
 * you fulfil them by hand from the admin dashboard — which is a perfectly
 * normal way to run this while you're small.
 */

export async function deliverDiamonds(order) {
  // TODO: call your real supplier here, e.g.:
  //
  // const res = await fetch("https://supplier.example.com/api/order", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${process.env.SUPPLIER_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     productId: order.packageId,
  //     userId: order.gameUserId,
  //     serverId: order.gameServerId,
  //   }),
  // });
  // const data = await res.json();
  // if (!res.ok) throw new Error(data.message || "Supplier delivery failed");
  // return { success: true, supplierRef: data.orderId };

  return {
    success: false,
    supplierRef: null,
    note: "Supplier API not connected yet — fulfil this order manually.",
  };
}
