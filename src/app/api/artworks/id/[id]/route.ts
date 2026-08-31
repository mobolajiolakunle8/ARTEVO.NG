import { db } from "@/db";
import { publishLive } from "@/lib/sync";
import { artworks } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDatabaseSeeded();
  const { id } = await params;
  const numId = parseInt(id, 10);

  try {
    const body = await request.json();

    const [updated] = await db
      .update(artworks)
      .set({
        title: body.title,
        artist: body.artist,
        collectionSlug: body.collectionSlug,
        story: body.story,
        price: Number(body.price),
        image: body.image,
        images: body.images,
        sizeOptions: body.sizeOptions,
        orientation: body.orientation,
        editionType: body.editionType,
        framingOptions: body.framingOptions,
        inStock: body.inStock,
        featured: body.featured,
        watermarkEnabled: body.watermarkEnabled,
        auctionEnabled: body.auctionEnabled,
        minBid: body.minBid !== undefined ? Number(body.minBid) : undefined,
        bidIncrement: body.bidIncrement !== undefined ? Number(body.bidIncrement) : undefined,
        auctionEndTime: body.auctionEndTime ? new Date(body.auctionEndTime) : undefined,
        auctionStatus: body.auctionStatus,
        currentHighestBid: body.currentHighestBid !== undefined ? Number(body.currentHighestBid) : undefined,
      })
      .where(eq(artworks.id, numId))
      .returning();

    publishLive({ channel: "artworks", action: "update", id: numId });
    return NextResponse.json({ artwork: updated });
  } catch (error) {
    console.error("PUT /api/artworks/id/[id] error:", error);
    return NextResponse.json({ error: "Failed to update artwork" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDatabaseSeeded();
  const { id } = await params;
  const numId = parseInt(id, 10);

  try {
    await db.delete(artworks).where(eq(artworks.id, numId));
    publishLive({ channel: "artworks", action: "delete", id: numId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/artworks/id/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete artwork" }, { status: 500 });
  }
}
