import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { queryArticle, queryCollection, queryArtworks, queryPublishedArticles } from "@/db/queries";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, User, Share2, Layers } from "lucide-react";

export const revalidate = 0;

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await queryArticle(slug);

  if (!article) {
    notFound();
  }

  // Linked collection if exists
  let linkedColl = null;
  let linkedArtworks: any[] = [];
  if (article.collectionSlug) {
    linkedColl = await queryCollection(article.collectionSlug);
    linkedArtworks = (await queryArtworks())
      .filter((a) => a.collectionSlug === article.collectionSlug)
      .slice(0, 3);
  }

  const related = (await queryPublishedArticles()).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-8">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#B5965A] hover:text-[#A85C43] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Journal
        </Link>

        {/* Header Title */}
        <div className="space-y-4 border-b border-[#161616]/10 pb-8">
          <div className="flex items-center gap-3 text-xs uppercase font-mono text-[#B5965A] font-semibold">
            <span>{article.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#161616] leading-tight font-medium">
            {article.title}
          </h1>

          <div className="flex items-center justify-between pt-2 text-xs text-[#B7AEA2]">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#A85C43]" /> {article.author}</span>
            <span>Published {new Date(article.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>

        {/* Cover Image */}
        <div className="rounded overflow-hidden shadow-2xl border border-[#161616]/10 aspect-[16/9]">
          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
        </div>

        {/* Article Body */}
        <div className="prose prose-stone max-w-none text-base text-[#161616]/85 font-light leading-relaxed space-y-6 pt-4">
          <p className="font-serif italic text-lg text-[#161616] leading-snug border-l-2 border-[#A85C43] pl-4">
            {article.excerpt}
          </p>

          <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed font-sans">
            {article.content}
          </div>
        </div>

        {/* Linked Collection Feature Box */}
        {linkedColl && (
          <div className="my-12 p-8 bg-[#161616] text-[#FAF7F2] rounded border border-[#B5965A]/40 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#FAF7F2]/10 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B5965A] font-mono block">Linked Collection</span>
                <h3 className="font-serif text-2xl text-[#FAF7F2]">{linkedColl.name}</h3>
              </div>
              <Link
                href={`/collections/${linkedColl.slug}`}
                className="text-xs uppercase tracking-widest bg-[#A85C43] text-[#FAF7F2] px-4 py-2 rounded hover:bg-[#874632] transition-colors"
              >
                Browse Collection →
              </Link>
            </div>

            {linkedArtworks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {linkedArtworks.map((art) => (
                  <Link key={art.id} href={`/artwork/${art.slug}`} className="group bg-[#FAF7F2]/10 p-3 rounded hover:bg-[#FAF7F2]/20 transition-colors">
                    <img src={art.image} alt={art.title} className="w-full h-32 object-cover rounded mb-2" />
                    <span className="text-[10px] font-mono text-[#B5965A]">{art.refCode}</span>
                    <h4 className="font-serif text-sm text-[#FAF7F2] group-hover:text-[#B5965A] truncate">{art.title}</h4>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
