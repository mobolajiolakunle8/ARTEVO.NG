import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminDashboardClient from "./AdminDashboardClient";
import AdminShell from "./AdminShell";
import { isDatabaseConfigured } from "@/db";
import {
  queryArtworks,
  queryCollections,
  queryOrders,
  queryBids,
  queryAllArticles,
  querySpaces,
  queryBankSettings,
  queryInquiries,
  queryRecentEvents,
  querySubscribers,
} from "@/db/queries";

export const revalidate = 0;

export default async function AdminPage() {
  const [allArtworks, allCollections, allOrders, allBids, allArticles, allSpaces, bankConfig, allInquiries, allEvents, allSubscribers] =
    await Promise.all([
      queryArtworks(),
      queryCollections(),
      queryOrders(),
      queryBids(),
      queryAllArticles(),
      querySpaces(),
      queryBankSettings(),
      queryInquiries(),
      queryRecentEvents(100),
      querySubscribers(),
    ]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <AdminShell>
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
          databaseReady={isDatabaseConfigured()}
        />
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}
