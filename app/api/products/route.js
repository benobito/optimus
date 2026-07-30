import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { getDb, saveDb } from "@/lib/db";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

function isAdmin() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function GET() {
  const db = await getDb();
  return NextResponse.json({ games: db.data.games });
}

// Add a new package to an existing game (admin only)
export async function POST(request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { gameId, label, diamonds, price } = await request.json();
  if (!gameId || !label || price == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = await getDb();
  const game = db.data.games.find((g) => g.id === gameId);
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

  const pkg = {
    id: `${gameId}-${nanoid(6)}`,
    label,
    diamonds: Number(diamonds) || 0,
    price: Number(price),
  };
  game.packages.push(pkg);
  await saveDb(db);
  return NextResponse.json({ package: pkg }, { status: 201 });
}
