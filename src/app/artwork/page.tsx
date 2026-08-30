import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import Link from "next/link";
import { db } from "@/db";
import { artworks, collections } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { desc } from "drizzle-orm";
import { fallbackArtworks, fallbackCollections } from "@/lib/fallback-data";

export const revalidate = 0;

export default async function ArtworkListPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; orientation?: string; search?: string }>;
}) {
  const { collection, orientation, search } = await searchParams;
  let allColls: any[] = fallbackCollections;
  let allArtworks: any[] = fallbackArtworks;

  try {
    await ensureDatabaseSeeded();
    const [dbCollections, dbArtworks] = await Promise.all([
      db.select().from(collections).orderBy(collections.displayOrder),
      db.select().from(artworks).orderBy(desc(artworks.createdAt)),
    ]);
    if (dbCollections.length) allColls = dbCollections;
    if (dbArtworks.length) allArtworks = dbArtworks;
  } catch (error) {
    console.error("[ARTÉVO] Artwork listing fallback active:", error);
  }

  let filtered = allArtworks;

  if (collection && collection !== "all") {
    filtered = filtered.filter((a) => a.collectionSlug === collection);
  }

  if (orientation && orientation !== "all") {
    filtered = filtered.filter((a) => a.orientation === orientation);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.artist.toLowerCase().includes(q) ||
        a.refCode.toLowerCase().includes(q)
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />

      {/* Page Banner */}
      <section className="bg-[#161616] text-[#FAF7F2] py-16 px-4 sm:px-6 lg:px-8 border-b border-[#B5965A]/30">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] text-[#B5965A] font-semibold">Gallery Catalog</span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#FAF7F2]">All Masterworks</h1>
          <p className="font-serif italic text-base sm:text-lg text-[#B7AEA2]">
            Discover curated contemporary pieces ready for immediate order or private bidding.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Filter Navigation Bar */}
        <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded p-4 mb-10 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          {/* Collection Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/artwork"
              className={`text-xs uppercase tracking-wider px-3.5 py-1.5 rounded transition-colors font-medium ${
                !collection || collection === "all"
                  ? "bg-[#161616] text-[#FAF7F2]"
                  : "bg-[#161616]/5 text-[#161616] hover:bg-[#161616]/10"
              }`}
            >
              All Works
            </Link>
            {allColls.map((c) => (
              <Link
                key={c.id}
                href={`/artwork?collection=${c.slug}${orientation ? `&orientation=${orientation}` : ""}`}
                className={`text-xs uppercase tracking-wider px-3.5 py-1.5 rounded transition-colors font-medium ${
                  collection === c.slug
                    ? "bg-[#A85C43] text-[#FAF7F2]"
                    : "bg-[#161616]/5 text-[#161616] hover:bg-[#161616]/10"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Orientation Filter */}
          <div className="flex items-center gap-2 border-l border-[#161616]/10 pl-4">
            <span className="text-xs uppercase tracking-wider text-[#B7AEA2]">Format:</span>
            {["Portrait", "Landscape", "Square"].map((o) => (
              <Link
                key={o}
                href={`/artwork?${collection ? `collection=${collection}&` : ""}orientation=${o}`}
                className={`text-xs uppercase tracking-wider px-2.5 py-1 rounded transition-colors ${
                  orientation === o ? "bg-[#B5965A] text-[#161616] font-semibold" : "text-[#161616] hover:bg-[#161616]/5"
                }`}
              >
                {o}
              </Link>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((art) => (
              <ArtworkCard key={art.id} artwork={art} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <h3 className="font-serif text-2xl text-[#161616]">No Artworks Found</h3>
            <p className="text-xs text-[#B7AEA2]">Try clearing filters or search term.</p>
            <Link
              href="/artwork"
              className="inline-block text-xs uppercase tracking-widest bg-[#161616] text-[#FAF7F2] px-6 py-2.5 rounded hover:bg-[#A85C43] transition-colors"
            >
              Reset Filters
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
