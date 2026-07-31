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

/**
 * ID / NICKNAME CHECK
 * ===================
 * Powers the "check" button next to the game ID field on the storefront —
 * lets the customer confirm their ID is correct by showing their in-game
 * username before they pay, which cuts down on wrong-ID support tickets.
 *
 * This needs a "check role / get nickname" endpoint, which most diamond
 * suppliers (Smile One, UniPin, etc.) provide alongside their order API —
 * check your supplier's docs for something like `checkRole` or
 * `get-username`. There are also standalone ID-checker APIs on RapidAPI
 * ("ID Game Checker", etc.) if your main supplier doesn't offer one.
 *
 * Until you connect one, this returns `success: false` and the storefront
 * shows a friendly "can't verify right now" message instead of blocking
 * checkout — customers can still order, they just don't get the extra
 * nickname confirmation.
 */
export async function checkNickname(order) {
  // TODO: call your real supplier's role-check endpoint here, e.g.:
  //
  // const res = await fetch("https://supplier.example.com/api/check-role", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${process.env.SUPPLIER_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     game: order.gameId,
  //     userId: order.gameUserId,
  //     serverId: order.gameServerId,
  //   }),
  // });
  // const data = await res.json();
  // if (!res.ok || !data.username) throw new Error(data.message || "ID មិនត្រឹមត្រូវ");
  // return { success: true, nickname: data.username };

  return {
    success: false,
    nickname: null,
    note: "ID checker API not connected yet — see lib/supplier.js",
  };
}
