"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, ArrowUp, X } from "lucide-react";
import { BRAND, whatsappHref } from "@/lib/brand";
import { initFirebaseAnalytics } from "@/lib/firebase";

/**
 * Global site widgets (single file keeps the deploy footprint lean):
 * 1. Accessibility — skip link, focus management, reduced-motion support
 * 2. WhatsApp concierge floating button with dismissible tooltip
 * 3. Back-to-top controller
 */
export default function SiteWidgets() {
  const [showTop, setShowTop] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  // Firebase Analytics — initialise once on first mount
  useEffect(() => {
    initFirebaseAnalytics().catch(() => {});
  }, []);

  // Route-change analytics — fire-and-forget page/artwork view events.
  useEffect(() => {
    if (!pathname || lastTracked.current === pathname) return;
    lastTracked.current = pathname;
    const isArtwork = pathname.startsWith("/artwork/");
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: isArtwork ? "artwork_view" : "page_view",
        path: pathname,
        artworkSlug: isArtwork ? pathname.split("/artwork/")[1] : null,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    // Skip-link focus management: first Tab press moves focus to #main-content
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Tab" && !event.shiftKey && document.activeElement === document.body) {
        const skip = document.querySelector("[data-skip-link]") as HTMLElement | null;
        if (skip) {
          skip.focus();
          event.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    // Honor prefers-reduced-motion
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = (matches: boolean) =>
      document.documentElement.classList.toggle("reduce-motion", matches);
    const onMotionChange = (event: MediaQueryListEvent) => applyMotion(event.matches);
    applyMotion(media.matches);
    media.addEventListener("change", onMotionChange);

    // Back-to-top visibility
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // One-time concierge tooltip per session
    const seen = sessionStorage.getItem("artevo_tip");
    if (!seen) {
      const timer = setTimeout(() => {
        setShowTip(true);
        sessionStorage.setItem("artevo_tip", "1");
        setTimeout(() => setShowTip(false), 6000);
      }, 3500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("keydown", onKey);
        media.removeEventListener("change", onMotionChange);
      };
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      media.removeEventListener("change", onMotionChange);
    };
  }, []);

  const waHref = whatsappHref();

  return (
    <>
      {/* Accessibility skip link (visually hidden until focused) */}
      <a
        href="#main-content"
        data-skip-link
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#A85C43] focus:text-[#FAF7F2] focus:px-4 focus:py-2 focus:rounded focus:text-xs focus:font-bold focus:shadow-lg focus:outline-none"
        style={{ top: "-100vh", left: "-100vw" }}
      >
        Skip to main content
      </a>

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
    </>
  );
}
