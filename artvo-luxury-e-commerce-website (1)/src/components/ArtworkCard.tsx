"use client";

import Link from "next/link";
import WatermarkImage from "./WatermarkImage";
import { ArrowUpRight, Gavel, ShoppingBag, Eye, Heart } from "lucide-react";
import { useWishlist } from "./useWishlist";

interface ArtworkCardProps {
  artwork: {
    id: number;
    slug: string;
    title: string;
    artist: string;
    collectionSlug: string;
    price: number;
    refCode: string;
    image: string;
    orientation: string;
    editionType: string;
    watermarkEnabled?: boolean | null;
    auctionEnabled?: boolean | null;
    currentHighestBid?: number | null;
  };
  aspectRatio?: "portrait" | "landscape" | "square" | "auto";
}

export default function ArtworkCard({ artwork, aspectRatio }: ArtworkCardProps) {
  const { has, toggle } = useWishlist();
  const saved = has(artwork.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      id: artwork.id,
      slug: artwork.slug,
      title: artwork.title,
      artist: artwork.artist,
      refCode: artwork.refCode,
      image: artwork.image,
      price: artwork.price,
      collectionSlug: artwork.collectionSlug,
    });
  };

  const calculatedAspect =
    aspectRatio ||
    (artwork.orientation === "Landscape"
      ? "landscape"
      : artwork.orientation === "Square"
      ? "square"
      : "portrait");

  return (
    <div className="group flex flex-col bg-[#FAF7F2] border border-[#161616]/10 rounded-sm overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Artwork Image Container */}
      <div className="relative">
        <Link href={`/artwork/${artwork.slug}`} className="block overflow-hidden">
          <WatermarkImage
            src={artwork.image}
            alt={artwork.title}
            aspectRatio={calculatedAspect}
            showWatermark={artwork.watermarkEnabled !== false}
          />
        </Link>

        {/* Ref Code Badge */}
        <div className="absolute top-3 left-3 bg-[#161616]/90 text-[#FAF7F2] text-[10px] font-mono tracking-widest px-2.5 py-1 rounded backdrop-blur-sm border border-[#B5965A]/40 uppercase">
          {artwork.refCode}
        </div>

        {/* Auction Badge */}
        {artwork.auctionEnabled && (
          <div className="absolute top-3 right-14 bg-[#A85C43] text-[#FAF7F2] text-[10px] font-medium tracking-wider px-2.5 py-1 rounded flex items-center gap-1 shadow">
            <Gavel className="w-3 h-3" /> Auction Active
          </div>
        )}

        {/* Wishlist Heart */}
        <button
          onClick={handleWishlist}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm border shadow transition-all ${
            saved
              ? "bg-[#A85C43] text-[#FAF7F2] border-[#A85C43]"
              : "bg-[#FAF7F2]/90 text-[#161616] border-[#161616]/10 hover:bg-[#FAF7F2] hover:text-[#A85C43]"
          }`}
        >
          <Heart className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
        </button>

        {/* Quick Hover Overlay */}
        <div className="absolute inset-0 bg-[#161616]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4 pointer-events-none group-hover:pointer-events-auto">
          <Link
            href={`/artwork/${artwork.slug}`}
            className="p-3 bg-[#FAF7F2] text-[#161616] rounded-full hover:bg-[#A85C43] hover:text-[#FAF7F2] transition-colors shadow-lg"
            title="View Piece Details"
          >
            <Eye className="w-5 h-5" />
          </Link>
          <Link
            href={`/order?artRef=${artwork.refCode}`}
            className="p-3 bg-[#A85C43] text-[#FAF7F2] rounded-full hover:bg-[#161616] transition-colors shadow-lg"
            title="Get this Piece"
          >
            <ShoppingBag className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-[#FAF7F2]">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#B5965A] uppercase tracking-widest mb-1.5 font-medium">
            <span>{artwork.collectionSlug.replace("-", " ")}</span>
            <span className="text-[#B7AEA2]">{artwork.editionType}</span>
          </div>

          <Link href={`/artwork/${artwork.slug}`}>
            <h3 className="font-serif text-lg text-[#161616] group-hover:text-[#A85C43] transition-colors font-medium leading-snug">
              {artwork.title}
            </h3>
          </Link>

          <p className="text-xs text-[#B7AEA2] mt-1 font-sans">by {artwork.artist}</p>
        </div>

        {/* Pricing & CTA Row */}
        <div className="mt-5 pt-4 border-t border-[#161616]/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] tracking-wider uppercase text-[#B7AEA2] block">
              {artwork.auctionEnabled ? "Highest Bid" : "Price"}
            </span>
            <span className="font-serif text-lg font-semibold text-[#161616]">
              ₦{((artwork.auctionEnabled && artwork.currentHighestBid) ? artwork.currentHighestBid : artwork.price).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {artwork.auctionEnabled ? (
              <Link
                href={`/artwork/${artwork.slug}#auction`}
                className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider bg-[#161616] text-[#FAF7F2] px-3.5 py-2 rounded hover:bg-[#A85C43] transition-colors shadow-sm"
              >
                <Gavel className="w-3.5 h-3.5 text-[#B5965A]" /> Bid
              </Link>
            ) : (
              <Link
                href={`/order?artRef=${artwork.refCode}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider bg-[#161616] text-[#FAF7F2] px-3.5 py-2 rounded hover:bg-[#A85C43] transition-colors shadow-sm"
              >
                Get Piece
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
