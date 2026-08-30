import Link from "next/link";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
import { BRAND } from "@/lib/brand";
import { MapPin, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#161616] text-[#FAF7F2] pt-10 pb-6 border-t border-[#B5965A]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[10px] uppercase tracking-wider text-[#B7AEA2] pb-6 border-b border-[#FAF7F2]/10">
          <span>Archival cotton rag</span>
          <span className="hidden sm:inline text-[#B5965A]">•</span>
          <span>Hand-finished framing</span>
          <span className="hidden sm:inline text-[#B5965A]">•</span>
          <span>Naira bank transfer</span>
          <span className="hidden sm:inline text-[#B5965A]">•</span>
          <span>Global delivery</span>
        </div>

        {/* Main columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Logo variant="light" />
            <p className="text-[11px] text-[#B7AEA2] leading-relaxed max-w-[220px]">
              Contemporary art & wall décor from Ibadan, Nigeria. Est. {BRAND.foundedYear}.
            </p>
            <div className="space-y-1.5 text-[11px] text-[#B7AEA2]">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#B5965A]" /> Ibadan, Oyo State
              </span>
              <a href={`mailto:${BRAND.email}`} className="flex items-center gap-1.5 hover:text-[#FAF7F2] transition-colors">
                <Mail className="w-3 h-3 text-[#B5965A]" /> {BRAND.email}
              </a>
              <a
                href={`https://wa.me/${BRAND.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#25D366] transition-colors"
              >
                <MessageCircle className="w-3 h-3 text-[#25D366]" /> WhatsApp {BRAND.whatsappDisplay}
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-2.5">
            <h5 className="text-[10px] tracking-widest uppercase text-[#B5965A] font-semibold mb-3">Explore</h5>
            {[
              ["Collections", "/collections"],
              ["Artwork", "/artwork"],
              ["Spaces", "/spaces"],
              ["Journal", "/journal"],
              ["Auction Room", "/auction"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="block text-[11px] text-[#B7AEA2] hover:text-[#FAF7F2] transition-colors">
                {label}
              </Link>
            ))}
          </div>

          {/* Service */}
          <div className="space-y-2.5">
            <h5 className="text-[10px] tracking-widest uppercase text-[#B5965A] font-semibold mb-3">Service</h5>
            {[
              ["Track Order", "/track-order"],
              ["Wishlist", "/wishlist"],
              ["About", "/about"],
              ["Contact", "/contact"],
              ["Admin Studio", "/admin"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="block text-[11px] text-[#B7AEA2] hover:text-[#FAF7F2] transition-colors">
                {label}
              </Link>
            ))}
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 border-t border-[#FAF7F2]/10 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] text-[#B7AEA2]">
          <span>© {new Date().getFullYear()} {BRAND.legalName}. "Art. Evolved." All rights reserved.</span>
          <span>{BRAND.locationLabel} · Est. {BRAND.foundedYear}</span>
        </div>
      </div>
    </footer>
  );
}
