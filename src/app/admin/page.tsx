import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminDashboardClient from "./AdminDashboardClient";
import { db } from "@/db";
import {
  artworks,
  collections,
  orders,
  bids,
  journalArticles,
  spacesContent,
  paymentSettings,
  inquiries,
  analyticsEvents,
  newsletterSubscribers,
} from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { desc } from "drizzle-orm";
import {
  fallbackArticles,
  fallbackArtworks,
  fallbackBankSettings,
  fallbackBids,
  fallbackCollections,
  fallbackEvents,
  fallbackInquiries,
  fallbackOrders,
  fallbackSpaces,
  fallbackSubscribers,
} from "@/lib/fallback-data";

export const revalidate = 0;

export default async function AdminPage() {
  let allArtworks: any[] = fallbackArtworks;
  let allCollections: any[] = fallbackCollections;
  let allOrders: any[] = fallbackOrders;
  let allBids: any[] = fallbackBids;
  let allArticles: any[] = fallbackArticles;
  let allSpaces: any[] = fallbackSpaces;
  let bankConfig: any = fallbackBankSettings;
  let allInquiries: any[] = fallbackInquiries;
  let allEvents: any[] = fallbackEvents;
  let allSubscribers: any[] = fallbackSubscribers;

  try {
    await ensureDatabaseSeeded();
    const results = await Promise.all([
      db.select().from(artworks).orderBy(desc(artworks.createdAt)),
      db.select().from(collections).orderBy(collections.displayOrder),
      db.select().from(orders).orderBy(desc(orders.createdAt)),
      db.select().from(bids).orderBy(desc(bids.createdAt)),
      db.select().from(journalArticles).orderBy(desc(journalArticles.createdAt)),
      db.select().from(spacesContent),
      db.select().from(paymentSettings).limit(1),
      db.select().from(inquiries).orderBy(desc(inquiries.createdAt)),
      db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(100),
      db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)),
    ]);
    if (results[0].length) allArtworks = results[0];
    if (results[1].length) allCollections = results[1];
    allOrders = results[2];
    allBids = results[3];
    if (results[4].length) allArticles = results[4];
    if (results[5].length) allSpaces = results[5];
    bankConfig = results[6][0] || fallbackBankSettings;
    allInquiries = results[7];
    allEvents = results[8];
    allSubscribers = results[9];
  } catch (error) {
    console.error("[ARTÉVO] Admin database fallback active:", error);
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <AdminDashboardClient
          initialArtworks={allArtworks}
          initialCollections={allCollections}
          initialOrders={allOrders}
          initialBids={allBids}
          initialArticles={allArticles}
          initialSpaces={allSpaces}
          initialBank={bankConfig || null}
          initialInquiries={allInquiries}
          initialEvents={allEvents}
          initialSubscribers={allSubscribers}
        />
      </main>
      <Footer />
    </div>
  );
}
