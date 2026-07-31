import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkNickname } from "@/lib/supplier";

// Called by the "check" button next to the ID field on the storefront.
// Looks up the player's in-game nickname so they can confirm the ID is
// correct before paying. See lib/supplier.js -> checkNickname().
export async function POST(request) {
  const { gameId, gameUserId, gameServerId } = await request.json();

  if (!gameId || !gameUserId) {
    return NextResponse.json({ error: "សូមបញ្ចូល ID សិន" }, { status: 400 });
  }

  const db = await getDb();
  const game = db.data.games.find((g) => g.id === gameId);
  if (!game) {
    return NextResponse.json({ error: "រកមិនឃើញ Game" }, { status: 404 });
  }
  if (game.needsServerId && !gameServerId) {
    return NextResponse.json({ error: "សូមបញ្ចូល Server ID ផងដែរ" }, { status: 400 });
  }

  try {
    const result = await checkNickname({
      gameId,
      gameUserId,
      gameServerId,
    });

    if (!result.success) {
      // Supplier not connected yet, or lookup genuinely failed — either
      // way don't block checkout, just say we can't verify right now.
      return NextResponse.json(
        { verified: false, note: result.note || "មិនអាចត្រួតពិនិត្យបានទេពេលនេះ" },
        { status: 200 }
      );
    }

    return NextResponse.json({ verified: true, nickname: result.nickname });
  } catch (err) {
    return NextResponse.json({ verified: false, note: err.message }, { status: 200 });
  }
}
