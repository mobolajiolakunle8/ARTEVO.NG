import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import SiteWidgets from "@/components/SiteWidgets";

export const metadata: Metadata = {
  title: "ARTÉVO — Art. Evolved. | Contemporary Art from Ibadan, Nigeria",
  description:
    "ARTÉVO is an African-origin contemporary art and wall décor brand based in Ibadan, Nigeria (Est. 2026). We create, curate, print, frame and sell meaningful artwork for homes, offices, hospitality and gifting. All pricing in Nigerian Naira (₦). WhatsApp: 0903 019 2034.",
  icons: {
    icon: "/logo/artevo-mark.svg",
    apple: "/logo/artevo-mark.svg",
  },
  openGraph: {
    title: "ARTÉVO — Art. Evolved. | Ibadan, Nigeria",
    description: "Premium accessible African contemporary art from Ibadan. Est. 2026. Framed, curated and delivered with care.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#FAF7F2] text-[#161616] antialiased" id="main-content">
        <a
          href="#main-content"
          data-skip-link
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#A85C43] focus:text-[#FAF7F2] focus:px-4 focus:py-2 focus:rounded focus:text-xs focus:font-bold focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        {children}
        <SiteWidgets />
      </body>
    </html>
  );
}
