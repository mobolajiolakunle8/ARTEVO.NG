import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderFormClient from "./OrderFormClient";
import { db } from "@/db";
import { artworks } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq } from "drizzle-orm";
import { fallbackArtworks } from "@/lib/fallback-data";

export const revalidate = 0;

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ artRef?: string; size?: string; frame?: string; amount?: string }>;
}) {
  const { artRef, size, frame, amount } = await searchParams;

  let allArtworks: any[] = fallbackArtworks;
  let selectedArt: any = artRef ? fallbackArtworks.find((art) => art.refCode === artRef) || null : null;

  try {
    await ensureDatabaseSeeded();
    allArtworks = await db.select().from(artworks);
    if (artRef) {
      const [found] = await db.select().from(artworks).where(eq(artworks.refCode, artRef));
      selectedArt = found || selectedArt;
    }
  } catch (error) {
    console.error("[ARTÉVO] Order page fallback active:", error);
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <OrderFormClient
          preSelectedArt={selectedArt}
          preSize={size}
          preFrame={frame}
          preAmount={amount ? Number(amount) : null}
          allArtworks={allArtworks}
        />
      </main>
      <Footer />
    </div>
  );
}
