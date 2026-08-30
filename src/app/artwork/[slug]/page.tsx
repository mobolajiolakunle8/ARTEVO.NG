import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtworkDetailClient from "./ArtworkDetailClient";
import { queryArtwork, queryCollection, queryArtworks } from "@/db/queries";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://artevo-art.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await queryArtwork(slug);

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

  const artwork = await queryArtwork(slug);

  if (!artwork) {
    notFound();
  }

  const coll = await queryCollection(artwork.collectionSlug);

  const related = (await queryArtworks())
    .filter((r) => r.collectionSlug === artwork.collectionSlug)
    .slice(0, 4);

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
