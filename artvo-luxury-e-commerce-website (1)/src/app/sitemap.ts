import type { MetadataRoute } from "next";
import { db } from "@/db";
import { artworks, collections, journalArticles, spacesContent } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://artevo-art.com";

// Generated per-request so a build never fails when the database is unreachable.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/collections",
    "/artwork",
    "/spaces",
    "/journal",
    "/auction",
    "/about",
    "/contact",
    "/track-order",
    "/wishlist",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const [arts, colls, articles, spaces] = await Promise.all([
      db.select().from(artworks),
      db.select().from(collections),
      db.select().from(journalArticles).where(eq(journalArticles.published, true)),
      db.select().from(spacesContent),
    ]);

    const artRoutes = arts.map((a) => ({
      url: `${BASE_URL}/artwork/${a.slug}`,
      lastModified: new Date(a.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    const collRoutes = colls.map((c) => ({
      url: `${BASE_URL}/collections/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const articleRoutes = articles.map((a) => ({
      url: `${BASE_URL}/journal/${a.slug}`,
      lastModified: new Date(a.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    const spaceRoutes = spaces.map((s) => ({
      url: `${BASE_URL}/spaces/${s.spaceKey}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...artRoutes, ...collRoutes, ...articleRoutes, ...spaceRoutes];
  } catch {
    return staticRoutes;
  }
}
