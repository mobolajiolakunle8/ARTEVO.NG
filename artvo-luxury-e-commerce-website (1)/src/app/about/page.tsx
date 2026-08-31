import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import Link from "next/link";
import { BRAND, whatsappHref } from "@/lib/brand";
import { ShieldCheck, Award, MapPin, Sparkles, Layers, ArrowRight, MessageCircle, Phone } from "lucide-react";

export const metadata = {
  title: "About ARTÉVO — Ibadan, Nigeria · Est. 2026",
  description:
    "ARTÉVO is an African-origin contemporary art brand based in Ibadan, Nigeria. Founded in 2026, we create, curate, print, frame and sell meaningful artwork for homes, offices, hospitality and collectors.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />

      <section className="bg-[#161616] text-[#FAF7F2] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#B5965A]/30">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Logo variant="light" className="justify-center mb-2" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#B5965A] font-semibold">
            Est. {BRAND.foundedYear} · {BRAND.locationLabel}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#FAF7F2]">The ARTÉVO Narrative</h1>
          <p className="font-serif italic text-lg text-[#B7AEA2] max-w-2xl mx-auto">
            An African contemporary art brand from Ibadan — creating meaningful artwork for modern sanctuaries.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#A85C43] font-semibold">Origin & Purpose</span>
            <h2 className="font-serif text-3xl text-[#161616]">Rooted in Ibadan. Framed for Modern Sanctuaries.</h2>
            <p className="text-sm text-[#161616]/80 leading-relaxed font-light">
              Founded in {BRAND.foundedYear} and based in {BRAND.locationLabel}, ARTÉVO was established to bridge the gap between museum-grade African contemporary visual expression and refined architectural spaces. We create, curate, print, frame, and sell meaningful wall art for luxury homes, executive headquarters, boutique hotels, and discerning private collectors.
            </p>
            <p className="text-sm text-[#161616]/80 leading-relaxed font-light">
              From our Ibadan studio we reject cheap mass reproduction in favor of 310gsm archival cotton rag paper, pigment inks with long-term colour permanence, and hand-mitered hardwood frames — art made meaningful for the spaces you live and work in.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#161616]/15 bg-white">
                <MapPin className="w-3.5 h-3.5 text-[#A85C43]" /> {BRAND.addressLine}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#161616]/15 bg-white">
                Est. {BRAND.foundedYear}
              </span>
            </div>
          </div>

          <div className="rounded overflow-hidden shadow-2xl border border-[#161616]/10 aspect-[4/3]">
            <img
              src="https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="ARTÉVO craftsmanship from Ibadan"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-[#161616]/10">
          <div className="p-6 bg-[#FAF7F2] border border-[#161616]/10 rounded space-y-2">
            <ShieldCheck className="w-6 h-6 text-[#B5965A]" />
            <h3 className="font-serif text-lg text-[#161616]">Archival Paper & Ink</h3>
            <p className="text-xs text-[#B7AEA2] leading-relaxed">310gsm 100% cotton rag smooth paper. Zero optical brighteners, preventing yellowing over decades.</p>
          </div>
          <div className="p-6 bg-[#FAF7F2] border border-[#161616]/10 rounded space-y-2">
            <Layers className="w-6 h-6 text-[#B5965A]" />
            <h3 className="font-serif text-lg text-[#161616]">Hand-Finished Wood</h3>
            <p className="text-xs text-[#B7AEA2] leading-relaxed">Solid ebonized black oak, terracotta walnut, and brushed gold aluminum frames with museum acrylic glazing.</p>
          </div>
          <div className="p-6 bg-[#FAF7F2] border border-[#161616]/10 rounded space-y-2">
            <Award className="w-6 h-6 text-[#B5965A]" />
            <h3 className="font-serif text-lg text-[#161616]">Authenticated Works</h3>
            <p className="text-xs text-[#B7AEA2] leading-relaxed">Each piece features our signature physical Certificate of Authenticity and embossed ARTÉVO stamp.</p>
          </div>
        </div>

        <div className="bg-[#161616] text-[#FAF7F2] p-10 rounded text-center space-y-5">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2]">Experience ARTÉVO Curation</h2>
          <p className="text-xs text-[#B7AEA2] max-w-xl mx-auto">
            Speak with our Ibadan studio for wall-scale consultations, framing advice, or commissions. Reach us on WhatsApp {BRAND.whatsappDisplay}.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp {BRAND.whatsappDisplay}
            </a>
            <a
              href={`tel:${BRAND.phoneTel}`}
              className="inline-flex items-center gap-2 border border-[#FAF7F2]/30 text-[#FAF7F2] px-6 py-3 rounded text-xs uppercase tracking-widest font-semibold hover:border-[#B5965A] hover:text-[#B5965A] transition-colors"
            >
              <Phone className="w-4 h-4" /> Call {BRAND.phoneDisplay}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#A85C43] text-[#FAF7F2] px-6 py-3 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#874632] transition-colors"
            >
              Contact Concierge <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
