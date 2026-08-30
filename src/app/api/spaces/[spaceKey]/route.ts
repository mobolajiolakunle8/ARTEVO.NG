import { db } from "@/db";
import { spacesContent, artworks, journalArticles } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ spaceKey: string }> }
) {
  await ensureDatabaseSeeded();
  const { spaceKey } = await params;

  try {
    const [content] = await db
      .select()
      .from(spacesContent)
      .where(eq(spacesContent.spaceKey, spaceKey));

    if (!content) {
      return NextResponse.json({ error: "Space content not found" }, { status: 404 });
    }

    // Get relevant artworks
    let relevantArtworks = [];
    if (spaceKey === "limited") {
      relevantArtworks = await db.select().from(artworks).where(eq(artworks.editionType, "Limited Edition (1/25)")).limit(6);
    } else if (spaceKey === "custom") {
      relevantArtworks = await db.select().from(artworks).where(eq(artworks.collectionSlug, "custom")).limit(6);
    } else {
      relevantArtworks = await db.select().from(artworks).limit(6);
    }

    // Get relevant journal articles
    const articles = await db.select().from(journalArticles).limit(3);

    return NextResponse.json({
      space: content,
      artworks: relevantArtworks,
      articles,
    });
  } catch (error) {
    console.error("GET /api/spaces/[spaceKey] error:", error);
    return NextResponse.json({ error: "Failed to fetch space content" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ spaceKey: string }> }
) {
  await ensureDatabaseSeeded();
  const { spaceKey } = await params;

  try {
    const body = await request.json();

    const [updated] = await db
      .update(spacesContent)
      .set({
        title: body.title,
        subtitle: body.subtitle,
        heroImage: body.heroImage,
        description: body.description,
        features: body.features,
        caseStudies: body.caseStudies,
        ctaTitle: body.ctaTitle,
        ctaText: body.ctaText,
        updatedAt: new Date(),
      })
      .where(eq(spacesContent.spaceKey, spaceKey))
      .returning();

    return NextResponse.json({ space: updated });
  } catch (error) {
    console.error("PUT /api/spaces/[spaceKey] error:", error);
    return NextResponse.json({ error: "Failed to update space content" }, { status: 500 });
  }
}
