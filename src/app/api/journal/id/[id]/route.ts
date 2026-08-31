import { db } from "@/db";
import { adminUnauthorized, verifyAdminRequest } from "@/lib/admin-auth";
import { publishLive } from "@/lib/sync";
import { journalArticles } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminRequest(request);
  if (!admin.ok) return adminUnauthorized(admin.reason);

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

    publishLive({ channel: "journal", action: "update", id: numId });
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
  const admin = await verifyAdminRequest(request);
  if (!admin.ok) return adminUnauthorized(admin.reason);

  await ensureDatabaseSeeded();
  const { id } = await params;
  const numId = parseInt(id, 10);

  try {
    await db.delete(journalArticles).where(eq(journalArticles.id, numId));
    publishLive({ channel: "journal", action: "delete", id: numId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/journal/id/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
