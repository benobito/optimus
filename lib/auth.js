import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "dev-only-change-me";
export const ADMIN_COOKIE = "gemdrop_admin";

function sign(value) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

/** Build the cookie value for a valid admin session. */
export function makeSessionToken() {
  const payload = `admin:${Date.now()}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

/** Verify a cookie value came from makeSessionToken() and isn't expired (7 days). */
export function verifySessionToken(token) {
  if (!token || !token.includes(".")) return false;
  const [encoded, sig] = token.split(".");
  let payload;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return false;
  }
  if (sign(payload) !== sig) return false;
  const ts = Number(payload.split(":")[1] || 0);
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - ts < SEVEN_DAYS;
}

export function checkAdminPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || "changeme123";
  return password === expected;
}
