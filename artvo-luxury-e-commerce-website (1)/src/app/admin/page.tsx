import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminDashboardClient from "./AdminDashboardClient";
import AdminShell from "./AdminShell";
import { isDatabaseConfigured } from "@/db";
import { verifyAdminCookie } from "@/lib/admin-auth";
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
  const admin = await verifyAdminCookie();

  const emptyDashboard = {
    allArtworks: [],
    allCollections: [],
    allOrders: [],
    allBids: [],
    allArticles: [],
    allSpaces: [],
    bankConfig: null,
    allInquiries: [],
    allEvents: [],
    allSubscribers: [],
  };

  const data = admin.ok
    ? await Promise.all([
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
      ]).then(
        ([
          allArtworks,
          allCollections,
          allOrders,
          allBids,
          allArticles,
          allSpaces,
          bankConfig,
          allInquiries,
          allEvents,
          allSubscribers,
        ]) => ({
          allArtworks,
          allCollections,
          allOrders,
          allBids,
          allArticles,
          allSpaces,
          bankConfig,
          allInquiries,
          allEvents,
          allSubscribers,
        })
      )
    : emptyDashboard;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <AdminShell>
          <AdminDashboardClient
            initialArtworks={data.allArtworks}
            initialCollections={data.allCollections}
            initialOrders={data.allOrders}
            initialBids={data.allBids}
            initialArticles={data.allArticles}
            initialSpaces={data.allSpaces}
            initialBank={data.bankConfig || null}
            initialInquiries={data.allInquiries}
            initialEvents={data.allEvents}
            initialSubscribers={data.allSubscribers}
            databaseReady={isDatabaseConfigured()}
          />
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}
