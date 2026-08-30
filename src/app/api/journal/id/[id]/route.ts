import { db } from "@/db";
import { journalArticles } from "@/db/schema";
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
      .update(journalArticles)
      .set({
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        author: body.author,
        category: body.category,
        coverImage: body.coverImage,
        collectionSlug: body.collectionSlug,
        published: body.published,
        readTime: body.readTime,
      })
      .where(eq(journalArticles.id, numId))
      .returning();

    return NextResponse.json({ article: updated });
  } catch (error) {
    console.error("PUT /api/journal/id/[id] error:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
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
    await db.delete(journalArticles).where(eq(journalArticles.id, numId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/journal/id/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
