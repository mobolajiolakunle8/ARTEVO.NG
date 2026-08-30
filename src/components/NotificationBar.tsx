"use client";

import { useEffect, useState } from "react";

const DEFAULT_NOTICE =
  "ARTÉVO Ibadan Studio is open for custom commissions, curated editions and private gifting — WhatsApp 0903 019 2034.";

export default function NotificationBar() {
  const [notice, setNotice] = useState(DEFAULT_NOTICE);

  useEffect(() => {
    let mounted = true;
    fetch("/api/site-content", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const value = data?.content?.notification?.message;
        if (mounted && typeof value === "string" && value.trim()) setNotice(value.trim());
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-[#161616] text-[#FAF7F2] border-b border-[#B5965A]/25 overflow-hidden" aria-label="ARTÉVO notification">
      <div className="notification-marquee py-2 text-[11px] uppercase tracking-[0.22em] text-[#B5965A] font-semibold whitespace-nowrap">
        <span>{notice}</span>
        <span aria-hidden="true">{notice}</span>
        <span aria-hidden="true">{notice}</span>
      </div>
    </div>
  );
}
