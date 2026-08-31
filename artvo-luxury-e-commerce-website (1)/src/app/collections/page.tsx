import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { queryCollections, queryArtworks } from "@/db/queries";
import { ArrowRight, Layers } from "lucide-react";

export const revalidate = 0;

export default async function CollectionsPage() {
  const allColls = await queryCollections();
  const allArts = await queryArtworks();
  const countsMap = new Map<string, number>();
  for (const art of allArts) {
    countsMap.set(art.collectionSlug, (countsMap.get(art.collectionSlug) || 0) + 1);
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />

      {/* Page Header */}
      <section className="bg-[#161616] text-[#FAF7F2] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#B5965A]/30">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[#B5965A] font-semibold">ARTÉVO Catalog</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#FAF7F2]">The Eight Collections</h1>
          <p className="font-serif italic text-base sm:text-lg text-[#B7AEA2] max-w-2xl mx-auto font-normal">
            From ancestral heritage to architectural minimalism, explore contemporary African artworks organized by thematic resonance.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {allColls.map((col) => {
            const numArtworks = countsMap.get(col.slug) || 0;
            return (
              <div
                key={col.id}
                className="group bg-[#FAF7F2] border border-[#161616]/10 rounded-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={col.coverImage}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3 bg-[#161616]/90 text-[#FAF7F2] text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded backdrop-blur-sm border border-[#B5965A]/30">
                    {numArtworks} {numArtworks === 1 ? "Piece" : "Pieces"}
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#B5965A] font-semibold block mb-1">Series 0{col.displayOrder}</span>
                    <h2 className="font-serif text-2xl text-[#161616] group-hover:text-[#A85C43] transition-colors">{col.name}</h2>
                    <h3 className="text-xs font-serif italic text-[#A85C43] mt-0.5">{col.subtitle}</h3>
                    <p className="text-xs text-[#161616]/75 mt-3 leading-relaxed font-light">{col.description}</p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#161616]/10 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-[#B7AEA2]">Archival Frame Ready</span>
                    <Link
                      href={`/collections/${col.slug}`}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest bg-[#161616] text-[#FAF7F2] px-5 py-2.5 rounded hover:bg-[#A85C43] transition-colors shadow-sm font-medium"
                    >
                      View Artwork <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
