"use client";

import { useEffect, useState } from "react";
import { MessageCircle, ArrowUp, X } from "lucide-react";
import { BRAND, whatsappHref } from "@/lib/brand";

export default function SiteWidgets() {
  const [showTop, setShowTop] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const seen = typeof window !== "undefined" && sessionStorage.getItem("artevo_tip");
    if (!seen) {
      const t = setTimeout(() => {
        setShowTip(true);
        sessionStorage.setItem("artevo_tip", "1");
        setTimeout(() => setShowTip(false), 6000);
      }, 3500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("scroll", onScroll);
      };
    }
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waHref = whatsappHref();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 print:hidden">
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="w-11 h-11 rounded-full bg-[#161616] text-[#FAF7F2] border border-[#B5965A]/40 shadow-lg flex items-center justify-center hover:bg-[#A85C43] transition-colors"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      <div className="relative flex items-center">
        {showTip && (
          <div className="absolute right-16 bottom-1 w-56 bg-[#FAF7F2] border border-[#B5965A]/50 rounded-lg shadow-xl p-3 text-xs text-[#161616]">
            <button
              onClick={() => setShowTip(false)}
              className="absolute top-1.5 right-1.5 text-[#161616]/40 hover:text-[#161616]"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <span className="font-serif text-sm block text-[#A85C43] mb-0.5">Speak to a Curator</span>
            Chat with our Ibadan studio on WhatsApp ({BRAND.whatsappDisplay}) for pricing, mockups & commissions.
          </div>
        )}

        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat with ARTÉVO on WhatsApp ${BRAND.whatsappDisplay}`}
          onMouseEnter={() => setShowTip(true)}
          className="w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform ring-4 ring-[#25D366]/20"
        >
          <MessageCircle className="w-7 h-7" fill="white" />
        </a>
      </div>
    </div>
  );
}
