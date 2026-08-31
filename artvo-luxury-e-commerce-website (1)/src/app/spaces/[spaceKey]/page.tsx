import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpaceEditorialClient from "./SpaceEditorialClient";
import { querySpace, queryArtworks, queryPublishedArticles } from "@/db/queries";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ spaceKey: string }>;
}) {
  const { spaceKey } = await params;

  const space = await querySpace(spaceKey);

  if (!space) {
    notFound();
  }

  // Relevant artworks
  const allArts = await queryArtworks();
  let relevantArtworks = [];
  if (spaceKey === "limited") {
    relevantArtworks = allArts.filter((a) => a.editionType === "Limited Edition (1/25)").slice(0, 6);
  } else if (spaceKey === "custom") {
    relevantArtworks = allArts.filter((a) => a.collectionSlug === "custom").slice(0, 6);
  } else {
    relevantArtworks = allArts.slice(0, 6);
  }
  if (relevantArtworks.length === 0) relevantArtworks = allArts.slice(0, 6);

  const articles = (await queryPublishedArticles()).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />
      <SpaceEditorialClient space={space} artworks={relevantArtworks} articles={articles} />
      <Footer />
    </div>
  );
}
