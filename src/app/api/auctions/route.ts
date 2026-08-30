import { db } from "@/db";
import { artworks, bids } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  await ensureDatabaseSeeded();
  try {
    const auctionArtworks = await db
      .select()
      .from(artworks)
      .where(eq(artworks.auctionEnabled, true))
      .orderBy(desc(artworks.createdAt));

    // Get bids for all
    const allBids = await db.select().from(bids).orderBy(desc(bids.createdAt));

    const result = auctionArtworks.map((art) => {
      const artBids = allBids.filter((b) => b.artworkId === art.id);
      return {
        ...art,
        bidCount: artBids.length,
        bids: artBids,
      };
    });

    return NextResponse.json({ auctions: result });
  } catch (error) {
    console.error("GET /api/auctions error:", error);
    return NextResponse.json({ error: "Failed to fetch auctions" }, { status: 500 });
  }
}
