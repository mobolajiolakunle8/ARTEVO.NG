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
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        {children}
        <SiteWidgets />
      </body>
    </html>
  );
}
