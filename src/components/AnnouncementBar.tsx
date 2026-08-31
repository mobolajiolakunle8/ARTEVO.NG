"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { useLiveSync } from "./useWishlist";

const DEFAULT_TICKER =
  "New arrivals in the African Soul collection | Limited editions now open for acquisition | Bespoke commissions for homes, offices & hospitality | Order via bank transfer with full tracking";

const DEFAULT_ENABLED = "1";

export default function AnnouncementBar() {
  const [ticker, setTicker] = useState(DEFAULT_TICKER);
  const [enabled, setEnabled] = useState(DEFAULT_ENABLED);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/site-content", { cache: "no-store" });
      if (res.ok) {
        const { content } = await res.json();
        const announcement = content?.announcement || {};
        if (announcement.ticker) setTicker(String(announcement.ticker));
        if (announcement.enabled !== undefined) setEnabled(String(announcement.enabled));
      }
    } catch {
      /* keep defaults */
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Cross-browser + cross-tab: refetch announcement copy when admin edits site content anywhere.
  useLiveSync(["site-content"], load);

  if (!loaded || enabled !== "1") return null;

  const items = ticker
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) return null;

  // Duplicate the sequence for a seamless infinite loop.
  const sequence = [...items, ...items];

  return (
    <div
      className="bg-[#161616] text-[#FAF7F2] border-b border-[#B5965A]/20 overflow-hidden"
      role="region"
      aria-label="ARTÉVO announcements"
    >
      <div className="artevo-marquee-track py-1.5">
        {sequence.map((item, index) => (
          <span key={index} className="artevo-marquee-item flex items-center gap-2.5 whitespace-nowrap">
            <Megaphone className="w-3 h-3 text-[#B5965A] shrink-0" aria-hidden="true" />
            <span className="text-[11px] tracking-wide font-sans">{item}</span>
            <span className="text-[#B5965A] mx-2" aria-hidden="true">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
