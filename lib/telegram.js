/**
 * TELEGRAM NOTIFICATIONS
 * ======================
 * Sends an instant Telegram message to the shop admin whenever something
 * happens (new order, order marked paid, etc). Uses a Telegram Bot — no
 * paid service needed, totally free.
 *
 * SETUP (5 minutes):
 * 1. Open Telegram, search for "@BotFather", send /newbot and follow the
 *    steps. It gives you a token that looks like:
 *      123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * 2. Send your new bot any message (e.g. "hi") so it's allowed to message
 *    you back. If you want notifications in a group instead, add the bot
 *    to that group.
 * 3. Get your chat id:
 *      - Easiest: message "@userinfobot" on Telegram, it replies with your
 *        numeric chat id.
 *      - Or open this in a browser after step 2 (replace TOKEN):
 *          https://api.telegram.org/botTOKEN/getUpdates
 *        and look for "chat":{"id": ...}
 * 4. Put both values in `.env.local`:
 *      TELEGRAM_BOT_TOKEN=123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *      TELEGRAM_CHAT_ID=123456789
 * 5. Restart the app (`npm run dev` / `npm run start`). Done — new orders
 *    will now ping your Telegram instantly.
 *
 * If the env vars aren't set, this silently does nothing (no crash), so
 * the shop keeps working fine without Telegram configured.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Send a plain-text message to the configured Telegram chat.
 * Never throws — logs and swallows errors so a Telegram hiccup can never
 * break an order/checkout flow.
 */
export async function sendTelegramMessage(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    // Not configured yet — skip quietly. See setup steps above.
    return { ok: false, skipped: true };
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("Telegram sendMessage failed:", data.description);
    }
    return data;
  } catch (err) {
    console.error("Telegram sendMessage error:", err);
    return { ok: false, error: String(err) };
  }
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Notify admin the moment a customer places a new order. */
export function notifyNewOrder(order) {
  const lines = [
    `🛎️ <b>ការបញ្ជាទិញថ្មី!</b>`,
    ``,
    `🆔 លេខការបញ្ជាទិញ: <code>${escapeHtml(order.id)}</code>`,
    `🎮 ហ្គេម: ${escapeHtml(order.gameName)}`,
    `💎 កញ្ចប់: ${escapeHtml(order.packageLabel)}`,
    `💵 តម្លៃ: $${Number(order.priceUsd).toFixed(2)}`,
    `👤 Game ID: <code>${escapeHtml(order.gameUserId)}</code>${
      order.gameServerId ? ` (Server: ${escapeHtml(order.gameServerId)})` : ""
    }`,
    `📞 ទំនាក់ទំនង: ${escapeHtml(order.contact)}`,
    `⏳ ស្ថានភាព: កំពុងរង់ចាំការទូទាត់`,
  ];
  return sendTelegramMessage(lines.join("\n"));
}

/** Notify admin when an order's status changes (paid, fulfilled, cancelled...). */
export function notifyOrderStatusChanged(order, previousStatus) {
  const STATUS_LABELS = {
    pending_payment: "កំពុងរង់ចាំការទូទាត់",
    paid_awaiting_fulfillment: "បានទូទាត់ - កំពុងបញ្ជូនពេជ្រ",
    fulfilled: "✅ បានបញ្ជូនរួចរាល់",
    cancelled: "❌ បានលុបចោល",
  };
  const lines = [
    `🔔 <b>ការផ្លាស់ប្ដូរស្ថានភាព</b>`,
    ``,
    `🆔 លេខការបញ្ជាទិញ: <code>${escapeHtml(order.id)}</code>`,
    `🎮 ${escapeHtml(order.gameName)} — ${escapeHtml(order.packageLabel)}`,
    `${STATUS_LABELS[previousStatus] || previousStatus} ➜ <b>${
      STATUS_LABELS[order.status] || order.status
    }</b>`,
  ];
  return sendTelegramMessage(lines.join("\n"));
}
