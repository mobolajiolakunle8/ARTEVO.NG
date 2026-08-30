import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtworkDetailClient from "./ArtworkDetailClient";
import { db } from "@/db";
import { artworks, collections } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fallbackArtworks, fallbackCollections } from "@/lib/fallback-data";

export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://artevo-art.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let artwork: any = fallbackArtworks.find((item) => item.slug === slug || item.refCode === slug);

  try {
    await ensureDatabaseSeeded();
    const [dbArtwork] = await db
      .select()
      .from(artworks)
      .where(or(eq(artworks.slug, slug), eq(artworks.refCode, slug)));
    if (dbArtwork) artwork = dbArtwork;
  } catch (error) {
    console.error("[ARTÉVO] Artwork metadata fallback active:", error);
  }

  if (!artwork) return { title: "Artwork Not Found — ARTÉVO" };

  const title = `${artwork.title} by ${artwork.artist} — ARTÉVO`;
  const description = `${artwork.editionType} • ${artwork.orientation}. ${artwork.story.slice(0, 150)}… Acquire this ${artwork.collectionSlug.replace("-", " ")} piece from ARTÉVO. Priced at ₦${artwork.price.toLocaleString()}.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/artwork/${artwork.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${BASE_URL}/artwork/${artwork.slug}`,
      images: [{ url: artwork.image, alt: artwork.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [artwork.image],
    },
  };
}

export default async function ArtworkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let artwork: any = fallbackArtworks.find((item) => item.slug === slug || item.refCode === slug);
  let coll: any = artwork ? fallbackCollections.find((item) => item.slug === artwork.collectionSlug) : null;
  let related: any[] = artwork ? fallbackArtworks.filter((item) => item.collectionSlug === artwork.collectionSlug).slice(0, 4) : [];

  try {
    await ensureDatabaseSeeded();
    const [dbArtwork] = await db
      .select()
      .from(artworks)
      .where(or(eq(artworks.slug, slug), eq(artworks.refCode, slug)));

    if (dbArtwork) {
      artwork = dbArtwork;
      const [dbCollection, dbRelated] = await Promise.all([
        db.select().from(collections).where(eq(collections.slug, artwork.collectionSlug)),
        db.select().from(artworks).where(eq(artworks.collectionSlug, artwork.collectionSlug)).limit(4),
      ]);
      coll = dbCollection[0] || coll;
      related = dbRelated.length ? dbRelated : related;
    }
  } catch (error) {
    console.error("[ARTÉVO] Artwork detail fallback active:", error);
  }

  if (!artwork) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: artwork.title,
    image: artwork.images && artwork.images.length > 0 ? artwork.images : [artwork.image],
    description: artwork.story,
    sku: artwork.refCode,
    brand: { "@type": "Brand", name: "ARTÉVO" },
    category: coll?.name || artwork.collectionSlug,
    creator: { "@type": "Person", name: artwork.artist },
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: artwork.price,
      availability: artwork.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${BASE_URL}/artwork/${artwork.slug}`,
      seller: { "@type": "Organization", name: "ARTÉVO Nigeria Limited" },
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <ArtworkDetailClient
        artwork={artwork}
        collection={coll || null}
        related={related.filter((r) => r.id !== artwork.id)}
      />
      <Footer />
    </div>
  );
}
