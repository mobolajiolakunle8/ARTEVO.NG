import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpaceEditorialClient from "./SpaceEditorialClient";
import { db } from "@/db";
import { spacesContent, artworks, journalArticles } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { fallbackArticles, fallbackArtworks, fallbackSpaces } from "@/lib/fallback-data";

export const revalidate = 0;

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ spaceKey: string }>;
}) {
  const { spaceKey } = await params;
  let space: any = fallbackSpaces.find((item) => item.spaceKey === spaceKey);
  let relevantArtworks: any[] = spaceKey === "custom" ? fallbackArtworks.filter((item) => item.collectionSlug === "custom") : fallbackArtworks;
  let articles: any[] = fallbackArticles;

  try {
    await ensureDatabaseSeeded();
    const [dbSpace] = await db.select().from(spacesContent).where(eq(spacesContent.spaceKey, spaceKey));
    if (dbSpace) {
      space = dbSpace;
      if (spaceKey === "limited") {
        relevantArtworks = await db.select().from(artworks).where(eq(artworks.editionType, "Limited Edition (1/25)")).limit(6);
      } else if (spaceKey === "custom") {
        relevantArtworks = await db.select().from(artworks).where(eq(artworks.collectionSlug, "custom")).limit(6);
      } else {
        relevantArtworks = await db.select().from(artworks).limit(6);
      }
      const dbArticles = await db.select().from(journalArticles).where(eq(journalArticles.published, true)).limit(3);
      if (dbArticles.length) articles = dbArticles;
    }
  } catch (error) {
    console.error("[ARTÉVO] Space detail fallback active:", error);
  }

  if (!space) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />
      <SpaceEditorialClient space={space} artworks={relevantArtworks} articles={articles} />
      <Footer />
    </div>
  );
}
