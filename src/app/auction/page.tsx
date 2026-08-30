import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuctionRoomClient from "./AuctionRoomClient";
import { db } from "@/db";
import { artworks, bids } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, desc } from "drizzle-orm";
import { fallbackArtworks, fallbackBids } from "@/lib/fallback-data";

export const revalidate = 0;

export default async function AuctionRoomPage() {
  let auctionArtworks: any[] = fallbackArtworks.filter((art) => art.auctionEnabled);
  let allBids: any[] = fallbackBids;

  try {
    await ensureDatabaseSeeded();
    const [dbAuctionArtworks, dbBids] = await Promise.all([
      db
        .select()
        .from(artworks)
        .where(eq(artworks.auctionEnabled, true))
        .orderBy(desc(artworks.createdAt)),
      db.select().from(bids).orderBy(desc(bids.createdAt)),
    ]);
    if (dbAuctionArtworks.length) auctionArtworks = dbAuctionArtworks;
    allBids = dbBids;
  } catch (error) {
    console.error("[ARTÉVO] Auction fallback active:", error);
  }

  const enrichedAuctions = auctionArtworks.map((art) => {
    const artBids = allBids.filter((b) => b.artworkId === art.id);
    return {
      ...art,
      bidCount: artBids.length,
      bids: artBids,
    };
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <AuctionRoomClient auctions={enrichedAuctions} />
      </main>
      <Footer />
    </div>
  );
}
