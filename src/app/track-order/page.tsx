import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackOrderClient from "./TrackOrderClient";
import { queryOrderByRef } from "@/db/queries";

export const revalidate = 0;

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ orderRef?: string }>;
}) {
  const { orderRef } = await searchParams;

  const initialOrder = await queryOrderByRef(orderRef);

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
