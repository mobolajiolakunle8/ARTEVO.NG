import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Layers, Crown, Sparkles, Building2, ArrowRight } from "lucide-react";

export const revalidate = 0;

export default function SpacesIndexPage() {
  const divisions = [
    {
      key: "editions",
      title: "ARTÉVO Editions",
      subtitle: "Curated Fine Art Prints for Elevated Residential Spaces",
      desc: "Ready-to-ship archival 310gsm cotton rag prints encased in ebonized hardwood, solid walnut, or floating gold frames.",
      icon: Layers,
      image: "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
    {
      key: "limited",
      title: "ARTÉVO Limited",
      subtitle: "Rare, Hand-Signed & strictly Numbered Collector Series",
      desc: "Strictly limited runs of 10 or 25 signed monotypes and gold-leaf works with physical Certificates of Authenticity.",
      icon: Crown,
      image: "https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
    {
      key: "custom",
      title: "ARTÉVO Custom Commissions",
      subtitle: "Bespoke Art for Penthouses, Estates & Private Clients",
      desc: "Collaborate directly with our master artists to create monumental 1-of-1 canvases matched to your interior scale and palette.",
      icon: Sparkles,
      image: "https://images.pexels.com/photos/29532559/pexels-photo-29532559.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
    {
      key: "spaces",
      title: "ARTÉVO Commercial & Hospitality",
      subtitle: "Turnkey Curation for Hotels, Offices & Flagship Developments",
      desc: "Comprehensive art curation, volume framing, and white-glove installation for hotels, resorts, and corporate headquarters.",
      icon: Building2,
      image: "https://images.pexels.com/photos/8488980/pexels-photo-8488980.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />

      <section className="bg-[#161616] text-[#FAF7F2] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#B5965A]/30">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[#B5965A] font-semibold">Editorial Curation</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#FAF7F2]">ARTÉVO Spaces</h1>
          <p className="font-serif italic text-base sm:text-lg text-[#B7AEA2] max-w-2xl mx-auto font-normal">
            Discover four distinct curatorial divisions designed to bring African contemporary art into homes, private collections, and architectural landmarks.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {divisions.map((div) => {
            const IconComp = div.icon;
            return (
              <div
                key={div.key}
                className="group bg-[#FAF7F2] border border-[#161616]/15 rounded-sm overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img src={div.image} alt={div.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 w-10 h-10 bg-[#161616] text-[#B5965A] rounded flex items-center justify-center shadow">
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-serif text-2xl text-[#161616] group-hover:text-[#A85C43] transition-colors">{div.title}</h2>
                    <h3 className="text-xs font-serif italic text-[#A85C43] mt-1">{div.subtitle}</h3>
                    <p className="text-xs text-[#161616]/75 mt-3 leading-relaxed font-light">{div.desc}</p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#161616]/10 flex justify-end">
                    <Link
                      href={`/spaces/${div.key}`}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest bg-[#161616] text-[#FAF7F2] px-6 py-3 rounded hover:bg-[#A85C43] transition-colors shadow-sm font-medium"
                    >
                      Explore Editorial Space <ArrowRight className="w-4 h-4" />
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
