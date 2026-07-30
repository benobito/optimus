import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb, saveDb } from "@/lib/db";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

function isAdmin() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

function findPackage(db, id) {
  for (const game of db.data.games) {
    const pkg = game.packages.find((p) => p.id === id);
    if (pkg) return { game, pkg };
  }
  return null;
}

export async function PATCH(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const found = findPackage(db, params.id);
  if (!found) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  const body = await request.json();
  if (body.label != null) found.pkg.label = body.label;
  if (body.diamonds != null) found.pkg.diamonds = Number(body.diamonds);
  if (body.price != null) found.pkg.price = Number(body.price);

  await saveDb(db);
  return NextResponse.json({ package: found.pkg });
}

export async function DELETE(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const found = findPackage(db, params.id);
  if (!found) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  found.game.packages = found.game.packages.filter((p) => p.id !== params.id);
  await saveDb(db);
  return NextResponse.json({ ok: true });
}
