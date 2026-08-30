import { db, isDatabaseConfigured } from "@/db";
import { collections, artworks } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, asc, count } from "drizzle-orm";
import { FALLBACK_COLLECTIONS, FALLBACK_ARTWORKS } from "@/lib/catalog-fallback";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      const countsMap = new Map<string, number>();
      for (const a of FALLBACK_ARTWORKS) countsMap.set(a.collectionSlug, (countsMap.get(a.collectionSlug) || 0) + 1);
      return NextResponse.json({
        collections: FALLBACK_COLLECTIONS.map((c) => ({ ...c, artworkCount: countsMap.get(c.slug) || 0 })),
      });
    }
    const list = await db.select().from(collections).orderBy(asc(collections.displayOrder));
    
    // Count artworks per collection
    const counts = await db
      .select({
        collectionSlug: artworks.collectionSlug,
        total: count(artworks.id),
      })
      .from(artworks)
      .groupBy(artworks.collectionSlug);

    const countsMap = new Map(counts.map((c) => [c.collectionSlug, c.total]));

    const enriched = list.map((col) => ({
      ...col,
      artworkCount: countsMap.get(col.slug) || 0,
    }));

    return NextResponse.json({ collections: enriched });
  } catch (error) {
    console.error("GET /api/collections error:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureDatabaseSeeded();
  try {
    const body = await request.json();
    const newSlug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const [created] = await db
      .insert(collections)
      .values({
        name: body.name,
        slug: newSlug,
        subtitle: body.subtitle || "",
        description: body.description || "",
        coverImage: body.coverImage || "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        featured: body.featured === true,
        displayOrder: Number(body.displayOrder) || 10,
      })
      .returning();

    return NextResponse.json({ collection: created });
  } catch (error) {
    console.error("POST /api/collections error:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
