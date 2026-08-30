import { db, isDatabaseConfigured } from "@/db";
import { artworks, collections } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { FALLBACK_ARTWORKS } from "@/lib/catalog-fallback";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (!isDatabaseConfigured()) {
    const fallback = FALLBACK_ARTWORKS;
    const search = searchParams.get("search");
    const collection = searchParams.get("collection");
    const filtered = fallback.filter((a) => {
      if (collection && collection !== "all" && a.collectionSlug !== collection) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.artist.toLowerCase().includes(q) ||
          a.refCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
    return NextResponse.json({ artworks: filtered });
  }
  const collection = searchParams.get("collection");
  const orientation = searchParams.get("orientation");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");
  const auctionOnly = searchParams.get("auctionOnly");

  try {
    const conditions = [];

    if (collection && collection !== "all") {
      conditions.push(eq(artworks.collectionSlug, collection));
    }
    if (orientation && orientation !== "all") {
      conditions.push(eq(artworks.orientation, orientation));
    }
    if (featured === "true") {
      conditions.push(eq(artworks.featured, true));
    }
    if (auctionOnly === "true") {
      conditions.push(eq(artworks.auctionEnabled, true));
    }
    if (search) {
      conditions.push(
        sql`(${artworks.title} ILIKE ${'%' + search + '%'} OR ${artworks.artist} ILIKE ${'%' + search + '%'} OR ${artworks.refCode} ILIKE ${'%' + search + '%'})`
      );
    }

    const items = await db
      .select()
      .from(artworks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(artworks.createdAt));

    return NextResponse.json({ artworks: items });
  } catch (error) {
    console.error("GET /api/artworks error:", error);
    return NextResponse.json({ error: "Failed to fetch artworks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureDatabaseSeeded();
  try {
    const body = await request.json();
    const newSlug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    // Generate unique refCode if not provided
    const randomNum = Math.floor(100 + Math.random() * 900);
    const generatedRef = body.refCode || `ART-${(body.collectionSlug || "GEN").toUpperCase().slice(0, 3)}-${randomNum}`;

    const [created] = await db
      .insert(artworks)
      .values({
        title: body.title,
        artist: body.artist || "ARTÉVO Master Studio",
        slug: newSlug,
        collectionSlug: body.collectionSlug || "african-soul",
        story: body.story || "A bespoke contemporary artwork curated by ARTÉVO Studio.",
        price: Number(body.price) || 1200,
        refCode: generatedRef,
        image: body.image || "https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        images: body.images || [body.image],
        sizeOptions: body.sizeOptions || [
          { size: "Medium (24 × 36 in)", price: Number(body.price) || 1200, dimensions: "24x36 inches" },
          { size: "Large (36 × 48 in)", price: Math.round((Number(body.price) || 1200) * 1.5), dimensions: "36x48 inches" },
        ],
        orientation: body.orientation || "Portrait",
        editionType: body.editionType || "Limited Edition (1/25)",
        framingOptions: body.framingOptions || [
          "Obsidian Ebonized Hardwood Frame",
          "Terracotta Solid Walnut Float Frame",
          "Muted Gold Brushed Aluminum Frame",
          "Museum Acrylic Unframed Wrapped Canvas",
        ],
        inStock: body.inStock !== false,
        featured: body.featured === true,
        watermarkEnabled: body.watermarkEnabled !== false,
        auctionEnabled: body.auctionEnabled === true,
        minBid: Number(body.minBid) || 0,
        bidIncrement: Number(body.bidIncrement) || 50,
        auctionEndTime: body.auctionEndTime ? new Date(body.auctionEndTime) : null,
        auctionStatus: body.auctionEnabled ? "active" : "none",
        currentHighestBid: Number(body.currentHighestBid) || Number(body.price) || 0,
      })
      .returning();

    return NextResponse.json({ artwork: created });
  } catch (error) {
    console.error("POST /api/artworks error:", error);
    return NextResponse.json({ error: "Failed to create artwork" }, { status: 500 });
  }
}
