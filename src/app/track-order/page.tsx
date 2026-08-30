import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackOrderClient from "./TrackOrderClient";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq } from "drizzle-orm";

export const revalidate = 0;

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ orderRef?: string }>;
}) {
  const { orderRef } = await searchParams;

  let initialOrder = null;
  if (orderRef) {
    try {
      await ensureDatabaseSeeded();
      const [found] = await db.select().from(orders).where(eq(orders.orderRef, orderRef.trim().toUpperCase()));
      initialOrder = found || null;
    } catch (error) {
      console.error("[ARTÉVO] Track order lookup unavailable:", error);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <TrackOrderClient initialOrder={initialOrder} initialRef={orderRef || ""} />
      </main>
      <Footer />
    </div>
  );
}
