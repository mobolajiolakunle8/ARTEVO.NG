import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PaymentClient from "./PaymentClient";
import { queryOrderByRef, queryBankSettings } from "@/db/queries";
import { notFound } from "next/navigation";

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

  const order = await queryOrderByRef(orderRef);

  if (!order) {
    notFound();
  }

  const bankSettings = await queryBankSettings();

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
