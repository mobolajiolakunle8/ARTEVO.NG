import { db } from "@/db";
import { journalArticles } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await ensureDatabaseSeeded();
  const { slug } = await params;

  try {
    const [article] = await db
      .select()
      .from(journalArticles)
      .where(eq(journalArticles.slug, slug));

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const related = await db
      .select()
      .from(journalArticles)
      .where(eq(journalArticles.published, true))
      .limit(3);

    return NextResponse.json({
      article,
      related: related.filter((a) => a.id !== article.id),
    });
  } catch (error) {
    console.error("GET /api/journal/[slug] error:", error);
    return NextResponse.json({ error: "Failed to fetch journal article" }, { status: 500 });
  }
}
