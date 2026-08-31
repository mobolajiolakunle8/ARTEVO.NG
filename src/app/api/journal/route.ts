import { db, isDatabaseConfigured } from "@/db";
import { publishLive } from "@/lib/sync";
import { journalArticles } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, desc, and } from "drizzle-orm";
import { FALLBACK_ARTICLES } from "@/db/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (!isDatabaseConfigured()) {
    const category = searchParams.get("category");
    const filtered = FALLBACK_ARTICLES.filter((a) => {
      if (category && category !== "all" && a.category !== category) return false;
      return true;
    });
    return NextResponse.json({ articles: filtered });
  }
  const category = searchParams.get("category");
  const collection = searchParams.get("collection");
  const publishedOnly = searchParams.get("publishedOnly");

  try {
    const conditions = [];

    if (publishedOnly === "true") {
      conditions.push(eq(journalArticles.published, true));
    }
    if (category && category !== "all") {
      conditions.push(eq(journalArticles.category, category));
    }
    if (collection) {
      conditions.push(eq(journalArticles.collectionSlug, collection));
    }

    const articles = await db
      .select()
      .from(journalArticles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(journalArticles.createdAt));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("GET /api/journal error:", error);
    return NextResponse.json({ error: "Failed to fetch journal articles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureDatabaseSeeded();
  try {
    const body = await request.json();
    const newSlug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const [created] = await db
      .insert(journalArticles)
      .values({
        title: body.title,
        slug: newSlug,
        excerpt: body.excerpt || "",
        content: body.content || "",
        author: body.author || "ARTÉVO Editorial Team",
        category: body.category || "Interior Styling",
        coverImage: body.coverImage || "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        collectionSlug: body.collectionSlug || null,
        published: body.published !== false,
        readTime: body.readTime || "5 min read",
      })
      .returning();

    publishLive({ channel: "journal", action: "create", id: created.slug });
    return NextResponse.json({ article: created });
  } catch (error) {
    console.error("POST /api/journal error:", error);
    return NextResponse.json({ error: "Failed to create journal article" }, { status: 500 });
  }
}
