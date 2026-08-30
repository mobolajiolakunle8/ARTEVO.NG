import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PaymentClient from "./PaymentClient";
import { db } from "@/db";
import { orders, paymentSettings } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { fallbackBankSettings } from "@/lib/fallback-data";

export const revalidate = 0;

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ orderRef?: string }>;
}) {
  const { orderRef } = await searchParams;

  if (!orderRef) {
    notFound();
  }

  let order: any = null;
  let bankSettings: any = fallbackBankSettings;

  try {
    await ensureDatabaseSeeded();
    const [foundOrder] = await db.select().from(orders).where(eq(orders.orderRef, orderRef));
    order = foundOrder || null;
    const [foundBankSettings] = await db.select().from(paymentSettings).limit(1);
    bankSettings = foundBankSettings || fallbackBankSettings;
  } catch (error) {
    console.error("[ARTÉVO] Payment lookup unavailable:", error);
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <PaymentClient order={order} bankSettings={bankSettings} />
      </main>
      <Footer />
    </div>
  );
}
