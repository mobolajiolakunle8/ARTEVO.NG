import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import ArtworkCard from "@/components/ArtworkCard";
import Link from "next/link";
import { queryCollections, queryArtworks, queryPublishedArticles } from "@/db/queries";
import { ArrowRight, ShieldCheck, Compass, Sparkles, Layers, Crown, Building2, Gavel, CheckCircle } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const [allColls, allArts, allArticles] = await Promise.all([
    queryCollections(),
    queryArtworks(),
    queryPublishedArticles(),
  ]);
  const allCollections = allColls.slice(0, 8);
  const featuredArtworks = allArts.filter((a) => a.featured).slice(0, 6);
  const articles = allArticles.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] bg-[#161616] text-[#FAF7F2] flex items-center justify-center overflow-hidden border-b border-[#B5965A]/30">
        {/* Background Ambient Imagery Overlay */}
        <div className="absolute inset-0 z-0 opacity-25 bg-cover bg-center" style={{ backgroundImage: `url('https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#161616] via-[#161616]/80 to-[#161616]/90 z-0" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-20 flex flex-col items-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F2]/10 border border-[#B5965A]/40 text-[#B5965A] text-xs uppercase tracking-[0.25em] mb-8 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" /> African Contemporary & Fine Art Curation
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#FAF7F2] max-w-4xl leading-[1.15]">
            Art. Evolved.
          </h1>

          <p className="mt-6 font-serif italic text-lg sm:text-2xl text-[#B7AEA2] max-w-2xl font-normal leading-relaxed">
            Meaningful contemporary wall artwork crafted and curated to transform luxury homes, executive offices, and hospitality spaces.
          </p>

          <p className="mt-3 text-xs sm:text-sm text-[#FAF7F2]/70 max-w-xl font-sans tracking-wide">
            Archival museum-grade prints, signed limited editions, and bespoke architectural commissions framing African heritage in modern luxury.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 bg-[#A85C43] text-[#FAF7F2] px-8 py-4 rounded text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#874632] transition-all shadow-xl hover:scale-105"
            >
              Explore Collections <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/spaces/custom"
              className="inline-flex items-center gap-2 bg-transparent text-[#FAF7F2] border border-[#B5965A] px-8 py-4 rounded text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B5965A] hover:text-[#161616] transition-all"
            >
              Commission Bespoke Art
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-[#FAF7F2]/10 text-center w-full max-w-3xl">
            <div>
              <span className="font-serif text-2xl text-[#B5965A] block">100%</span>
              <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2]">Archival Cotton Rag</span>
            </div>
            <div>
              <span className="font-serif text-2xl text-[#B5965A] block">8</span>
              <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2]">Curated Collections</span>
            </div>
            <div>
              <span className="font-serif text-2xl text-[#B5965A] block">25/25</span>
              <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2]">Numbered Limited Works</span>
            </div>
            <div>
              <span className="font-serif text-2xl text-[#B5965A] block">Direct</span>
              <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2]">Bank & Order Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Manifesto Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] border-b border-[#161616]/10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.3em] text-[#A85C43] font-semibold">The ARTÉVO Philosophy</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#161616]">
            Never mass-printed decor. <br className="hidden sm:inline" /> Every canvas carries a story and soul.
          </h2>
          <p className="text-sm sm:text-base text-[#161616]/80 leading-relaxed font-sans font-light max-w-3xl mx-auto">
            ARTÉVO sits at the intersection of African art heritage and contemporary architectural space. We collaborate with celebrated contemporary painters, sculptors, and digital monotype masters across West, East, and Southern Africa. Each creation is produced on 310gsm museum cotton paper, encased in hand-ebonized framing, and verified through order reference tracing.
          </p>
        </div>
      </section>

      {/* Curated Collections Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 border-b border-[#161616]/10 pb-6">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#B5965A] font-medium block mb-2">Artistic Categorization</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#161616]">Explore Collections</h2>
          </div>
          <Link href="/collections" className="mt-4 sm:mt-0 text-xs uppercase tracking-widest text-[#A85C43] hover:text-[#874632] font-semibold flex items-center gap-1.5">
            View All 8 Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allCollections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative h-80 rounded overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#161616]/10"
            >
              <img
                src={col.coverImage}
                alt={col.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-[#FAF7F2]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#B5965A] mb-1 font-mono">Collection</span>
                <h3 className="font-serif text-2xl text-[#FAF7F2] group-hover:text-[#B5965A] transition-colors">{col.name}</h3>
                <p className="text-xs text-[#B7AEA2] line-clamp-2 mt-1.5 font-light">{col.subtitle}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#FAF7F2] font-medium group-hover:translate-x-1 transition-transform">
                  Browse Series <ArrowRight className="w-3.5 h-3.5 text-[#A85C43]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Masterworks Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#161616] text-[#FAF7F2] border-y border-[#B5965A]/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 border-b border-[#FAF7F2]/10 pb-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#B5965A] font-medium block mb-2">Curated Highlights</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2]">Masterworks for Acquisition</h2>
            </div>
            <Link href="/artwork" className="mt-4 sm:mt-0 text-xs uppercase tracking-widest text-[#B5965A] hover:text-[#FAF7F2] font-semibold flex items-center gap-1.5">
              Explore All Artworks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArtworks.map((art) => (
              <ArtworkCard key={art.id} artwork={art} />
            ))}
          </div>
        </div>
      </section>

      {/* Four Editorial Spaces Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-[#A85C43] font-semibold block mb-2">Bespoke Curation Services</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#161616]">ARTÉVO Editorial Spaces</h2>
          <p className="text-xs sm:text-sm text-[#B7AEA2] mt-3">Tailored curatorial solutions for residential spaces, private collectors, and commercial developments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Editions */}
          <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded p-8 flex flex-col justify-between hover:border-[#A85C43] transition-colors shadow-sm">
            <div>
              <div className="w-10 h-10 rounded bg-[#161616] text-[#B5965A] flex items-center justify-center mb-6">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#B5965A] font-semibold">Residential Curation</span>
              <h3 className="font-serif text-2xl text-[#161616] mt-1 mb-3">ARTÉVO Editions</h3>
              <p className="text-xs text-[#161616]/70 leading-relaxed font-sans">
                Curated fine art prints and handcrafted frames for living rooms, master bedrooms, and dining halls. Archival museum cotton paper and ready-to-hang French cleat hardware.
              </p>
            </div>
            <Link
              href="/spaces/editions"
              className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#A85C43] font-semibold hover:translate-x-1 transition-transform"
            >
              Explore Residential Editions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Limited */}
          <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded p-8 flex flex-col justify-between hover:border-[#A85C43] transition-colors shadow-sm">
            <div>
              <div className="w-10 h-10 rounded bg-[#161616] text-[#B5965A] flex items-center justify-center mb-6">
                <Crown className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#B5965A] font-semibold">Rare & Numbered</span>
              <h3 className="font-serif text-2xl text-[#161616] mt-1 mb-3">ARTÉVO Limited</h3>
              <p className="text-xs text-[#161616]/70 leading-relaxed font-sans">
                Strictly numbered series of 1/10 or 1/25 monotypes. Individually hand-signed by the artist, embossed by ARTÉVO Studio, and registered on our collector ledger.
              </p>
            </div>
            <Link
              href="/spaces/limited"
              className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#A85C43] font-semibold hover:translate-x-1 transition-transform"
            >
              Acquire Limited Editions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Custom */}
          <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded p-8 flex flex-col justify-between hover:border-[#A85C43] transition-colors shadow-sm">
            <div>
              <div className="w-10 h-10 rounded bg-[#161616] text-[#B5965A] flex items-center justify-center mb-6">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#B5965A] font-semibold">Bespoke Canvas</span>
              <h3 className="font-serif text-2xl text-[#161616] mt-1 mb-3">ARTÉVO Custom Commissions</h3>
              <p className="text-xs text-[#161616]/70 leading-relaxed font-sans">
                Collaborate with our studio to create unique, large-scale artworks matched to your exact interior dimensions, color palettes, and architectural style.
              </p>
            </div>
            <Link
              href="/spaces/custom"
              className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#A85C43] font-semibold hover:translate-x-1 transition-transform"
            >
              Request Custom Work <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Spaces */}
          <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded p-8 flex flex-col justify-between hover:border-[#A85C43] transition-colors shadow-sm">
            <div>
              <div className="w-10 h-10 rounded bg-[#161616] text-[#B5965A] flex items-center justify-center mb-6">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#B5965A] font-semibold">Corporate & Hospitality</span>
              <h3 className="font-serif text-2xl text-[#161616] mt-1 mb-3">ARTÉVO Commercial Spaces</h3>
              <p className="text-xs text-[#161616]/70 leading-relaxed font-sans">
                End-to-end art curation and framing for boutique hotel developments, luxury resorts, executive boardrooms, and private clubs across Africa and internationally.
              </p>
            </div>
            <Link
              href="/spaces/spaces"
              className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#A85C43] font-semibold hover:translate-x-1 transition-transform"
            >
              View Commercial Projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Journal Teaser */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#161616]/5 border-t border-[#161616]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 border-b border-[#161616]/10 pb-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#A85C43] font-medium block mb-2">Editorial Stories</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#161616]">ARTÉVO Journal</h2>
            </div>
            <Link href="/journal" className="mt-4 sm:mt-0 text-xs uppercase tracking-widest text-[#A85C43] hover:text-[#874632] font-semibold flex items-center gap-1.5">
              Read All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((art) => (
              <Link
                key={art.id}
                href={`/journal/${art.slug}`}
                className="group bg-[#FAF7F2] rounded border border-[#161616]/10 overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <span className="text-[10px] uppercase tracking-widest text-[#B5965A] font-semibold block mb-2">{art.category} • {art.readTime}</span>
                  <h3 className="font-serif text-xl text-[#161616] group-hover:text-[#A85C43] transition-colors leading-snug">{art.title}</h3>
                  <p className="text-xs text-[#B7AEA2] mt-2 line-clamp-2">{art.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Collector Newsletter / Order Direct CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#161616] text-[#FAF7F2] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <Logo variant="light" className="justify-center" />
          <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2]">Begin Your ARTÉVO Collection Today</h2>
          <p className="text-xs sm:text-sm text-[#B7AEA2] max-w-xl mx-auto">
            Order directly online with artwork reference tracking. Receive our official private bank details, upload payment proof, and track framing and delivery in real-time.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/collections"
              className="bg-[#A85C43] text-[#FAF7F2] px-8 py-3.5 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#874632] transition-colors shadow-lg"
            >
              Browse Artwork Catalog
            </Link>
            <Link
              href="/track-order"
              className="border border-[#B5965A] text-[#FAF7F2] px-8 py-3.5 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#B5965A] hover:text-[#161616] transition-colors"
            >
              Track Existing Order
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
