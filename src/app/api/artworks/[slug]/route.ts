import { db } from "@/db";
import { artworks, collections } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await ensureDatabaseSeeded();
  const { slug } = await params;

  try {
    const [artwork] = await db
      .select()
      .from(artworks)
      .where(or(eq(artworks.slug, slug), eq(artworks.refCode, slug)));

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    // Get collection detail
    const [coll] = await db
      .select()
      .from(collections)
      .where(eq(collections.slug, artwork.collectionSlug));

    // Get related artworks from same collection
    const related = await db
      .select()
      .from(artworks)
      .where(eq(artworks.collectionSlug, artwork.collectionSlug))
      .limit(4);

    return NextResponse.json({
      artwork,
      collection: coll || null,
      related: related.filter((r) => r.id !== artwork.id),
    });
  } catch (error) {
    console.error("GET /api/artworks/[slug] error:", error);
    return NextResponse.json({ error: "Failed to fetch artwork detail" }, { status: 500 });
  }
}
