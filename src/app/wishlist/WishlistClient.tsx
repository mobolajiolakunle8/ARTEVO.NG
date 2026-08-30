"use client";

import Link from "next/link";
import { useWishlist } from "@/components/useWishlist";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

const fmt = (n: number) => `₦${(n || 0).toLocaleString()}`;

export default function WishlistClient() {
  const { items, remove } = useWishlist();

  return (
    <div className="space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#B5965A] font-semibold">Your Private Collection</span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#161616] flex items-center justify-center gap-3">
          <Heart className="w-7 h-7 text-[#A85C43]" fill="currentColor" /> Saved Artworks
        </h1>
        <p className="text-xs text-[#B7AEA2] max-w-lg mx-auto">
          Pieces you are considering. Your selections are stored privately on this device.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-[#FAF7F2] border border-[#161616]/10 rounded-lg">
          <Heart className="w-12 h-12 mx-auto text-[#B7AEA2]" />
          <h3 className="font-serif text-xl text-[#161616]">Your wishlist is empty</h3>
          <p className="text-xs text-[#B7AEA2]">Browse the gallery and tap the heart on any piece to save it here.</p>
          <Link
            href="/artwork"
            className="inline-flex items-center gap-2 bg-[#161616] text-[#FAF7F2] px-6 py-3 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#A85C43] transition-colors mt-2"
          >
            Explore Artworks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((art) => (
            <div key={art.id} className="group bg-[#FAF7F2] border border-[#161616]/10 rounded-sm overflow-hidden hover:shadow-xl transition-all">
              <div className="relative">
                <Link href={`/artwork/${art.slug}`}>
                  <img src={art.image} alt={art.title} className="w-full h-56 object-cover" />
                </Link>
                <button
                  onClick={() => remove(art.id)}
                  aria-label="Remove"
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FAF7F2]/90 text-red-600 border border-[#161616]/10 flex items-center justify-center shadow hover:bg-red-600 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute top-3 left-3 bg-[#161616]/90 text-[#FAF7F2] text-[10px] font-mono tracking-widest px-2.5 py-1 rounded uppercase">
                  {art.refCode}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#B5965A] font-medium">{art.collectionSlug.replace("-", " ")}</span>
                  <Link href={`/artwork/${art.slug}`}>
                    <h3 className="font-serif text-lg text-[#161616] hover:text-[#A85C43] transition-colors">{art.title}</h3>
                  </Link>
                  <p className="text-xs text-[#B7AEA2]">by {art.artist}</p>
                </div>
                <div className="pt-3 border-t border-[#161616]/10 flex items-center justify-between">
                  <span className="font-serif text-lg font-semibold text-[#161616]">{fmt(art.price)}</span>
                  <Link
                    href={`/order?artRef=${art.refCode}`}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider bg-[#161616] text-[#FAF7F2] px-3.5 py-2 rounded hover:bg-[#A85C43] transition-colors font-medium"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Acquire
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
