import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb, saveDb } from "@/lib/db";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";
import { deliverDiamonds } from "@/lib/supplier";
import { notifyOrderStatusChanged } from "@/lib/telegram";

function isAdmin() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function GET(request, { params }) {
  const db = await getDb();
  const order = db.data.orders.find((o) => o.id === params.id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}

const VALID_STATUSES = [
  "pending_payment",
  "paid_awaiting_fulfillment",
  "fulfilled",
  "cancelled",
];

export async function PATCH(request, { params }) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { status } = body || {};
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const db = await getDb();
  const order = db.data.orders.find((o) => o.id === params.id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const previousStatus = order.status;
  order.status = status;
  order.updatedAt = Date.now();

  // If admin marks it paid, try auto-fulfillment via the supplier API.
  if (status === "paid_awaiting_fulfillment") {
    const result = await deliverDiamonds(order);
    if (result.success) {
      order.status = "fulfilled";
      order.supplierRef = result.supplierRef;
    }
  }

  await saveDb(db);

  if (order.status !== previousStatus) {
    notifyOrderStatusChanged(order, previousStatus).catch(() => {});
  }

  return NextResponse.json({ order });
}
