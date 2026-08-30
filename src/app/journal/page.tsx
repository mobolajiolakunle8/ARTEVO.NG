import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { db } from "@/db";
import { journalArticles } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, desc } from "drizzle-orm";
import { fallbackArticles } from "@/lib/fallback-data";
import { ArrowRight, Clock } from "lucide-react";

export const revalidate = 0;

export default async function JournalIndexPage() {
  let articles: any[] = fallbackArticles;

  try {
    await ensureDatabaseSeeded();
    const dbArticles = await db
      .select()
      .from(journalArticles)
      .where(eq(journalArticles.published, true))
      .orderBy(desc(journalArticles.createdAt));
    if (dbArticles.length) articles = dbArticles;
  } catch (error) {
    console.error("[ARTÉVO] Journal fallback active:", error);
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />

      {/* Header Banner */}
      <section className="bg-[#161616] text-[#FAF7F2] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#B5965A]/30">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[#B5965A] font-semibold">Editorial & Writings</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#FAF7F2]">The ARTÉVO Journal</h1>
          <p className="font-serif italic text-base sm:text-lg text-[#B7AEA2] max-w-2xl mx-auto font-normal">
            Essays on African contemporary art history, interior styling, artist perspectives, and collector guidance.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-12">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {articles.map((art) => (
              <Link
                key={art.id}
                href={`/journal/${art.slug}`}
                className="group bg-[#FAF7F2] border border-[#161616]/10 rounded overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between text-[10px] uppercase font-mono text-[#B5965A] mb-2 font-semibold">
                      <span>{art.category}</span>
                      <span className="text-[#B7AEA2] flex items-center gap-1"><Clock className="w-3 h-3" /> {art.readTime}</span>
                    </div>
                    <h2 className="font-serif text-2xl text-[#161616] group-hover:text-[#A85C43] transition-colors leading-snug font-medium">
                      {art.title}
                    </h2>
                    <p className="text-xs text-[#161616]/75 mt-3 line-clamp-3 leading-relaxed font-light">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-[#161616]/5 flex items-center justify-between text-xs text-[#B7AEA2]">
                  <span>by {art.author}</span>
                  <span className="text-[#A85C43] uppercase tracking-wider font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-[#B7AEA2]">
            No published journal articles at this time.
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
