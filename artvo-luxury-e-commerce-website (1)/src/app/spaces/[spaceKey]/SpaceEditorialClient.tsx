"use client";

import Link from "next/link";
import ArtworkCard from "@/components/ArtworkCard";
import { ArrowRight, CheckCircle2, Building, Sparkles, ShieldCheck, Mail } from "lucide-react";

interface SpaceEditorialClientProps {
  space: any;
  artworks: any[];
  articles: any[];
}

export default function SpaceEditorialClient({ space, artworks, articles }: SpaceEditorialClientProps) {
  const features = space.features || [];
  const caseStudies = space.caseStudies || [];

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] bg-[#161616] text-[#FAF7F2] flex items-center justify-center border-b border-[#B5965A]/30 overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url('${space.heroImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/80 to-[#161616]/70 z-0" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-20 space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[#B5965A] font-semibold block">
            Editorial Space
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-[#FAF7F2] font-light">
            {space.title}
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-[#B7AEA2]">
            {space.subtitle}
          </p>
        </div>
      </section>

      {/* Main Narrative & Key Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#A85C43] font-semibold">Division Overview</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#161616]">Crafting Significance for Your Architecture</h2>
            <p className="text-sm text-[#161616]/80 leading-relaxed font-sans font-light">
              {space.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {features.map((feat: any, idx: number) => (
                <div key={idx} className="p-4 bg-[#FAF7F2] border border-[#161616]/10 rounded space-y-1">
                  <CheckCircle2 className="w-4 h-4 text-[#B5965A]" />
                  <h4 className="font-serif text-sm text-[#161616] font-semibold">{feat.title}</h4>
                  <p className="text-[11px] text-[#B7AEA2] leading-snug">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 rounded overflow-hidden shadow-2xl border border-[#161616]/10">
            <img src={space.heroImage} alt={space.title} className="w-full h-auto object-cover" />
          </div>
        </div>
      </section>

      {/* Projects & Case Studies */}
      {caseStudies.length > 0 && (
        <section className="bg-[#161616] text-[#FAF7F2] py-16 px-4 sm:px-6 lg:px-8 border-y border-[#B5965A]/20">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-[0.3em] text-[#B5965A] font-semibold block mb-1">Curation Portfolio</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2]">Featured Case Studies</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {caseStudies.map((cs: any, idx: number) => (
                <div key={idx} className="bg-[#FAF7F2]/5 border border-[#FAF7F2]/10 rounded overflow-hidden flex flex-col justify-between">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={cs.image} alt={cs.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#B5965A] uppercase">
                      <span>{cs.client}</span>
                      <span>{cs.location} • {cs.year}</span>
                    </div>
                    <h3 className="font-serif text-xl text-[#FAF7F2]">{cs.title}</h3>
                    <p className="text-xs text-[#B7AEA2] leading-relaxed font-light">{cs.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Curated Artwork Works */}
      {artworks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-10 border-b border-[#161616]/10 pb-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#B5965A] font-semibold block mb-1">Division Highlights</span>
              <h2 className="font-serif text-2xl text-[#161616]">Selection for Acquisition</h2>
            </div>
            <Link href="/artwork" className="text-xs uppercase tracking-widest text-[#A85C43] font-semibold hover:text-[#874632]">
              View All Works →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.map((art) => (
              <ArtworkCard key={art.id} artwork={art} />
            ))}
          </div>
        </section>
      )}

      {/* Editorial Articles Teaser */}
      {articles.length > 0 && (
        <section className="bg-[#161616]/5 py-16 px-4 sm:px-6 lg:px-8 border-t border-[#161616]/10">
          <div className="max-w-7xl mx-auto space-y-8">
            <h2 className="font-serif text-2xl text-[#161616]">Related Journal Writings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((art) => (
                <Link key={art.id} href={`/journal/${art.slug}`} className="bg-[#FAF7F2] p-5 rounded border border-[#161616]/10 hover:shadow-md transition-shadow">
                  <span className="text-[10px] uppercase text-[#B5965A] font-semibold block mb-1">{art.category}</span>
                  <h3 className="font-serif text-base text-[#161616] font-medium leading-snug">{art.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Space Call to Action */}
      <section className="bg-[#161616] text-[#FAF7F2] py-20 px-4 sm:px-6 text-center border-t border-[#B5965A]/30">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#FAF7F2]">{space.ctaTitle}</h2>
          <p className="text-xs sm:text-sm text-[#B7AEA2] leading-relaxed">{space.ctaText}</p>
          <div className="pt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#A85C43] text-[#FAF7F2] px-8 py-4 rounded text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#874632] transition-colors shadow-xl"
            >
              Contact Curatorial Division <Mail className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
