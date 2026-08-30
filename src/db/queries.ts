import { db, isDatabaseConfigured } from "@/db";
import {
  collections,
  artworks,
  journalArticles,
  spacesContent,
  orders,
  paymentSettings,
  bids,
  inquiries,
  analyticsEvents,
  newsletterSubscribers,
} from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";
import {
  FALLBACK_COLLECTIONS,
  FALLBACK_ARTWORKS,
  FALLBACK_ARTICLES,
  FALLBACK_SPACES,
  FALLBACK_PAYMENT,
  FALLBACK_ORDERS,
  FALLBACK_BIDS,
  FALLBACK_INQUIRIES,
  FALLBACK_EVENTS,
  FALLBACK_SUBSCRIBERS,
} from "@/lib/catalog-fallback";

/**
 * Safe query helpers: when PostgreSQL is not configured or unreachable, pages
 * and public APIs fall back to static catalog data instead of throwing. This
 * keeps the website live on Vercel even before DATABASE_URL is connected.
 *
 * Return type is anchored to the fallback (plain JSON-shaped) data, since that
 * is the shape both server pages and client components consume.
 */
async function withFallback<T>(fn: () => Promise<unknown>, fallback: T): Promise<T> {
  if (!isDatabaseConfigured()) return fallback;
  try {
    return (await fn()) as T;
  } catch (error) {
    console.error("[ARTÉVO] Database unavailable — serving fallback data:", error);
    return fallback;
  }
}

export const queryCollections = () =>
  withFallback(
    () => db.select().from(collections).orderBy(collections.displayOrder),
    FALLBACK_COLLECTIONS
  );

export const queryCollection = (slug: string) =>
  withFallback(
    async () =>
      (await db.select().from(collections).where(eq(collections.slug, slug)))[0] ?? null,
    FALLBACK_COLLECTIONS.find((c) => c.slug === slug) ?? null
  );

export const queryArtworks = () =>
  withFallback(
    () => db.select().from(artworks).orderBy(desc(artworks.createdAt)),
    FALLBACK_ARTWORKS
  );

export const queryArtwork = (slugOrRef: string) =>
  withFallback(
    async () =>
      (
        await db
          .select()
          .from(artworks)
          .where(or(eq(artworks.slug, slugOrRef), eq(artworks.refCode, slugOrRef)))
      )[0] ?? null,
    FALLBACK_ARTWORKS.find((a) => a.slug === slugOrRef || a.refCode === slugOrRef) ?? null
  );

export const queryPublishedArticles = () =>
  withFallback(
    () =>
      db
        .select()
        .from(journalArticles)
        .where(eq(journalArticles.published, true))
        .orderBy(desc(journalArticles.createdAt)),
    FALLBACK_ARTICLES
  );

export const queryAllArticles = () =>
  withFallback(
    () => db.select().from(journalArticles).orderBy(desc(journalArticles.createdAt)),
    FALLBACK_ARTICLES
  );

export const queryArticle = (slug: string) =>
  withFallback(
    async () =>
      (await db.select().from(journalArticles).where(eq(journalArticles.slug, slug)))[0] ?? null,
    FALLBACK_ARTICLES.find((a) => a.slug === slug) ?? null
  );

export const querySpaces = () => withFallback(() => db.select().from(spacesContent), FALLBACK_SPACES);

export const querySpace = (spaceKey: string) =>
  withFallback(
    async () =>
      (await db.select().from(spacesContent).where(eq(spacesContent.spaceKey, spaceKey)))[0] ?? null,
    FALLBACK_SPACES.find((s) => s.spaceKey === spaceKey) ?? null
  );

export const queryBankSettings = () =>
  withFallback(
    async () => (await db.select().from(paymentSettings).limit(1))[0] ?? null,
    FALLBACK_PAYMENT
  );

export const queryOrderByRef = (orderRef?: string | null) => {
  if (!orderRef) return Promise.resolve(null);
  const ref = orderRef.trim().toUpperCase();
  return withFallback(
    async () => (await db.select().from(orders).where(eq(orders.orderRef, ref)))[0] ?? null,
    null
  );
};

export const queryOrders = () =>
  withFallback(() => db.select().from(orders).orderBy(desc(orders.createdAt)), FALLBACK_ORDERS);

export const queryBids = () =>
  withFallback(() => db.select().from(bids).orderBy(desc(bids.createdAt)), FALLBACK_BIDS);

export const queryAuctionsWithBids = () =>
  withFallback(
    async () => {
      const arts = await db
        .select()
        .from(artworks)
        .where(eq(artworks.auctionEnabled, true))
        .orderBy(desc(artworks.createdAt));
      const allBids = await db.select().from(bids).orderBy(desc(bids.createdAt));
      return arts.map((art) => ({
        ...art,
        bidCount: allBids.filter((b) => b.artworkId === art.id).length,
        bids: allBids.filter((b) => b.artworkId === art.id),
      }));
    },
    FALLBACK_ARTWORKS.filter((a) => a.auctionEnabled).map((a) => ({ ...a, bidCount: 0, bids: [] }))
  );

export const queryInquiries = () =>
  withFallback(
    () => db.select().from(inquiries).orderBy(desc(inquiries.createdAt)),
    FALLBACK_INQUIRIES
  );

export const queryRecentEvents = (limit = 100) =>
  withFallback(
    async () => await db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(limit),
    FALLBACK_EVENTS
  );

export const querySubscribers = () =>
  withFallback(
    () => db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)),
    FALLBACK_SUBSCRIBERS
  );
