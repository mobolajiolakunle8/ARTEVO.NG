"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (!pathname || lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const isArtwork = pathname.startsWith("/artwork/");
    const artworkSlug = isArtwork ? pathname.split("/artwork/")[1] : null;

    // Standard page/artwork event
    const payload = {
      eventType: isArtwork ? "artwork_view" : "page_view",
      path: pathname,
      artworkSlug,
      meta: {
        referrer: typeof document !== "undefined" ? document.referrer : "",
        screen: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "",
      },
    };

    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});

    // Cross-tab sync
    try {
      const bc = new BroadcastChannel("artevo-analytics");
      bc.postMessage({ type: "page_view", path: pathname, ts: Date.now() });
      bc.close();
    } catch { /* BroadcastChannel not supported */ }

    // Core Web Vitals - observe LCP (largest contentful paint)
    if (typeof PerformanceObserver !== "undefined") {
      try {
        const po = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries.find((e: any) => e.entryType === "largest-contentful-paint");
          if (lcp && (lcp as any).startTime) {
            fetch("/api/analytics/event", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                eventType: "lcp",
                path: pathname,
                meta: { lcpMs: Math.round((lcp as any).startTime) },
              }),
              keepalive: true,
            }).catch(() => {});
          }
        });
        po.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch { /* observer unsupported */ }
    }
  }, [pathname]);

  return null;
}
