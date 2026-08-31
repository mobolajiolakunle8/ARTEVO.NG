import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderFormClient from "./OrderFormClient";
import { queryArtwork, queryArtworks } from "@/db/queries";

export const revalidate = 0;

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ artRef?: string; size?: string; frame?: string; amount?: string }>;
}) {
  const { artRef, size, frame, amount } = await searchParams;

  const selectedArt = artRef ? await queryArtwork(artRef) : null;
  const allArtworks = await queryArtworks();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <OrderFormClient
          preSelectedArt={selectedArt}
          preSize={size}
          preFrame={frame}
          preAmount={amount ? Number(amount) : null}
          allArtworks={allArtworks}
        />
      </main>
      <Footer />
    </div>
  );
}
