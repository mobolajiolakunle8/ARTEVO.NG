import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WishlistClient from "./WishlistClient";

export const metadata = {
  title: "Saved Artworks — ARTÉVO Wishlist",
  description: "Your privately saved ARTÉVO artworks for consideration and acquisition.",
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <WishlistClient />
      </main>
      <Footer />
    </div>
  );
}
