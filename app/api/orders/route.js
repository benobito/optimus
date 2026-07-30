import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { getDb, saveDb } from "@/lib/db";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";
import { createPaymentRequest } from "@/lib/payment";
import { notifyNewOrder } from "@/lib/telegram";

function isAdmin() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await getDb();
  const orders = [...db.data.orders].sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ orders });
}

export async function POST(request) {
  const body = await request.json();
  const { gameId, packageId, gameUserId, gameServerId, contact } = body || {};

  if (!gameId || !packageId || !gameUserId || !contact) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = await getDb();
  const game = db.data.games.find((g) => g.id === gameId);
  const pkg = game?.packages.find((p) => p.id === packageId);
  if (!game || !pkg) {
    return NextResponse.json({ error: "Invalid game or package" }, { status: 400 });
  }

  const order = {
    id: nanoid(10),
    gameId,
    gameName: game.name,
    packageId,
    packageLabel: pkg.label,
    diamonds: pkg.diamonds,
    priceUsd: pkg.price,
    gameUserId,
    gameServerId: gameServerId || null,
    contact,
    status: "pending_payment", // pending_payment -> paid_awaiting_fulfillment -> fulfilled | cancelled
    supplierRef: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  db.data.orders.push(order);
  await saveDb(db);

  const payment = await createPaymentRequest(order);

  // Ping the admin's Telegram instantly. Fire-and-forget: never let a
  // Telegram hiccup delay or break checkout for the customer.
  notifyNewOrder(order).catch(() => {});

  return NextResponse.json({ order, payment }, { status: 201 });
}
