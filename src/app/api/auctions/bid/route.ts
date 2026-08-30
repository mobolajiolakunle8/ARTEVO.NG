import { db } from "@/db";
import { artworks, bids, analyticsEvents } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await ensureDatabaseSeeded();
  try {
    const { artworkId, bidderName, bidderEmail, bidderPhone, amount } = await request.json();

    if (!artworkId || !bidderName || !bidderEmail || !amount) {
      return NextResponse.json({ error: "Missing required bid details" }, { status: 400 });
    }

    const [art] = await db.select().from(artworks).where(eq(artworks.id, Number(artworkId)));

    if (!art || !art.auctionEnabled) {
      return NextResponse.json({ error: "Artwork is not currently available for auction" }, { status: 400 });
    }

    const currentHighest = art.currentHighestBid || art.minBid || 0;
    const minRequired = currentHighest + (art.bidIncrement || 50);

    if (Number(amount) < minRequired) {
      return NextResponse.json(
        { error: `Bid must be at least ₦${minRequired.toLocaleString()} (current highest is ₦${currentHighest.toLocaleString()} + ₦${(art.bidIncrement || 50).toLocaleString()} increment)` },
        { status: 400 }
      );
    }

    // Insert bid
    const [newBid] = await db
      .insert(bids)
      .values({
        artworkId: Number(artworkId),
        bidderName,
        bidderEmail,
        bidderPhone: bidderPhone || "",
        amount: Number(amount),
        status: "active",
      })
      .returning();

    // Update artwork highest bid
    await db
      .update(artworks)
      .set({
        currentHighestBid: Number(amount),
      })
      .where(eq(artworks.id, Number(artworkId)));

    // Analytics event
    await db.insert(analyticsEvents).values({
      eventType: "bid_place",
      path: `/artwork/${art.slug}`,
      artworkSlug: art.slug,
      meta: { amount, bidderName, bidderEmail },
    });

    return NextResponse.json({ bid: newBid, currentHighestBid: Number(amount) });
  } catch (error) {
    console.error("POST /api/auctions/bid error:", error);
    return NextResponse.json({ error: "Failed to submit bid" }, { status: 500 });
  }
}
