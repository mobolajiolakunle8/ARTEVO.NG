import Link from "next/link";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
import { BRAND, whatsappHref } from "@/lib/brand";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#161616] text-[#FAF7F2] border-t border-[#B5965A]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 space-y-4">
            <Logo variant="light" />
            <p className="text-xs text-[#B7AEA2] leading-relaxed max-w-sm">
              Contemporary African art and wall décor from Ibadan, Nigeria — established 2026.
            </p>
            <div className="space-y-2 text-xs text-[#B7AEA2]">
              <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#B5965A]" /> {BRAND.locationLabel}</span>
              <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 hover:text-[#B5965A] transition-colors"><Mail className="w-3.5 h-3.5 text-[#B5965A]" /> {BRAND.email}</a>
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#25D366] transition-colors"><MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> WhatsApp {BRAND.whatsappDisplay}</a>
              <a href={`tel:${BRAND.phoneTel}`} className="flex items-center gap-2 hover:text-[#B5965A] transition-colors"><Phone className="w-3.5 h-3.5 text-[#B5965A]" /> {BRAND.phoneDisplay}</a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h5 className="font-serif text-xs tracking-widest uppercase text-[#B5965A] mb-4">Explore</h5>
            <ul className="space-y-2.5 text-xs text-[#B7AEA2]">
              <li><Link href="/collections" className="hover:text-[#FAF7F2]">Collections</Link></li>
              <li><Link href="/artwork" className="hover:text-[#FAF7F2]">Artwork</Link></li>
              <li><Link href="/spaces" className="hover:text-[#FAF7F2]">Spaces</Link></li>
              <li><Link href="/journal" className="hover:text-[#FAF7F2]">Journal</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h5 className="font-serif text-xs tracking-widest uppercase text-[#B5965A] mb-4">Support</h5>
            <ul className="space-y-2.5 text-xs text-[#B7AEA2]">
              <li><Link href="/track-order" className="hover:text-[#FAF7F2]">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-[#FAF7F2]">Contact</Link></li>
              <li><Link href="/about" className="hover:text-[#FAF7F2]">About</Link></li>
              <li><Link href="/admin" className="hover:text-[#B5965A] text-[#B5965A]">Admin</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-[#FAF7F2]/10 flex flex-col sm:flex-row justify-between gap-3 text-[11px] text-[#B7AEA2]">
          <span>© {new Date().getFullYear()} {BRAND.legalName}. Est. {BRAND.foundedYear}.</span>
          <span>Art. Evolved. · Nigerian Naira (₦)</span>
        </div>
      </div>
    </footer>
  );
}
