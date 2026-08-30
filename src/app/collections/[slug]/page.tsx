import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import Link from "next/link";
import { db } from "@/db";
import { collections, artworks } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { fallbackArtworks, fallbackCollections } from "@/lib/fallback-data";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

export const revalidate = 0;

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let coll: any = fallbackCollections.find((item) => item.slug === slug);
  let items: any[] = fallbackArtworks.filter((item) => item.collectionSlug === slug);

  try {
    await ensureDatabaseSeeded();
    const [dbCollection] = await db.select().from(collections).where(eq(collections.slug, slug));
    if (dbCollection) {
      coll = dbCollection;
      const dbItems = await db.select().from(artworks).where(eq(artworks.collectionSlug, slug));
      items = dbItems.length ? dbItems : items;
    }
  } catch (error) {
    console.error("[ARTÉVO] Collection detail fallback active:", error);
  }

  if (!coll) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />

      {/* Collection Hero */}
      <section className="relative bg-[#161616] text-[#FAF7F2] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#B5965A]/30 overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url('${coll.coverImage}')` }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <Link
            href="/collections"
            className="inline-flex items-center gap-1.5 text-xs text-[#B5965A] uppercase tracking-widest hover:text-[#FAF7F2] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Collections
          </Link>
          <span className="text-xs uppercase tracking-[0.3em] text-[#B5965A] font-semibold block">Collection</span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#FAF7F2]">{coll.name}</h1>
          <p className="font-serif italic text-lg text-[#B7AEA2] font-normal">{coll.subtitle}</p>
          <p className="text-xs sm:text-sm text-[#FAF7F2]/80 max-w-2xl mx-auto font-light leading-relaxed pt-2">
            {coll.description}
          </p>
        </div>
      </section>

      {/* Collection Gallery */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between pb-8 mb-10 border-b border-[#161616]/10 gap-4">
          <div className="text-xs uppercase tracking-widest text-[#B5965A] font-medium">
            Showing {items.length} {items.length === 1 ? "Artwork" : "Artworks"} in {coll.name}
          </div>
          <div className="flex items-center gap-3 text-xs text-[#B7AEA2]">
            <span className="flex items-center gap-1"><SlidersHorizontal className="w-3.5 h-3.5 text-[#B5965A]" /> All Sizes & Orientations</span>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((art) => (
              <ArtworkCard key={art.id} artwork={art} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <h3 className="font-serif text-xl text-[#161616]">No Artworks Currently Listed in this Collection</h3>
            <p className="text-xs text-[#B7AEA2] max-w-md mx-auto">
              New masterworks are added regularly. Request a custom commission or browse our other series.
            </p>
            <Link
              href="/spaces/custom"
              className="inline-block text-xs uppercase tracking-widest bg-[#161616] text-[#FAF7F2] px-6 py-3 rounded hover:bg-[#A85C43] transition-colors mt-4"
            >
              Request Custom Commission
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
