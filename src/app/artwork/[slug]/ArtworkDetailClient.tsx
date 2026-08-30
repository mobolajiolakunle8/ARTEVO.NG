"use client";

import { useState } from "react";
import Link from "next/link";
import WatermarkImage from "@/components/WatermarkImage";
import {
  ShoppingBag,
  Gavel,
  ShieldCheck,
  Check,
  Maximize2,
  Share2,
  Clock,
  Sparkles,
  Info,
  ArrowRight,
  Layers,
  Award
} from "lucide-react";

interface SizeOption {
  size: string;
  price: number;
  dimensions: string;
}

interface ArtworkDetailProps {
  artwork: {
    id: number;
    slug: string;
    title: string;
    artist: string;
    collectionSlug: string;
    story: string;
    price: number;
    refCode: string;
    image: string;
    images: string[] | null;
    sizeOptions: SizeOption[] | null;
    orientation: string;
    editionType: string;
    framingOptions: string[] | null;
    inStock: boolean | null;
    watermarkEnabled: boolean | null;
    auctionEnabled: boolean | null;
    minBid: number | null;
    bidIncrement: number | null;
    auctionEndTime: Date | string | null;
    auctionStatus: string | null;
    currentHighestBid: number | null;
  };
  collection: {
    name: string;
    subtitle: string | null;
  } | null;
  related: any[];
}

export default function ArtworkDetailClient({ artwork, collection, related }: ArtworkDetailProps) {
  const imagesList = artwork.images && artwork.images.length > 0 ? artwork.images : [artwork.image];
  const sizesList = artwork.sizeOptions && artwork.sizeOptions.length > 0
    ? artwork.sizeOptions
    : [
        { size: "Medium (24 × 36 in / 60 × 90 cm)", price: artwork.price, dimensions: "24x36 inches" },
        { size: "Large (36 × 48 in / 90 × 120 cm)", price: Math.round(artwork.price * 1.5), dimensions: "36x48 inches" },
        { size: "Grand Statement (48 × 72 in / 120 × 180 cm)", price: Math.round(artwork.price * 2.4), dimensions: "48x72 inches" },
      ];

  const framesList = artwork.framingOptions && artwork.framingOptions.length > 0
    ? artwork.framingOptions
    : [
        "Obsidian Ebonized Hardwood Frame",
        "Terracotta Solid Walnut Float Frame",
        "Muted Gold Brushed Aluminum Frame",
        "Museum Acrylic Unframed Wrapped Canvas",
      ];

  const [activeImage, setActiveImage] = useState(imagesList[0]);
  const [selectedSize, setSelectedSize] = useState<SizeOption>(sizesList[0]);
  const [selectedFrame, setSelectedFrame] = useState<string>(framesList[0]);
  const [showWatermark, setShowWatermark] = useState<boolean>(artwork.watermarkEnabled !== false);

  // Auction modal state
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [bidderName, setBidderName] = useState("");
  const [bidderEmail, setBidderEmail] = useState("");
  const [bidderPhone, setBidderPhone] = useState("");
  const [bidAmount, setBidAmount] = useState<number>(
    (artwork.currentHighestBid || artwork.minBid || artwork.price) + (artwork.bidIncrement || 50)
  );
  const [biddingSuccess, setBiddingSuccess] = useState(false);
  const [biddingError, setBiddingError] = useState("");
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  const calculatedPrice = selectedSize.price;

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBiddingError("");
    setIsSubmittingBid(true);

    try {
      const res = await fetch("/api/auctions/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: artwork.id,
          bidderName,
          bidderEmail,
          bidderPhone,
          amount: Number(bidAmount),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit bid");
      }

      setBiddingSuccess(true);
    } catch (err: any) {
      setBiddingError(err.message);
    } finally {
      setIsSubmittingBid(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#B7AEA2] mb-8">
        <Link href="/" className="hover:text-[#A85C43]">Home</Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-[#A85C43]">Collections</Link>
        <span>/</span>
        <Link href={`/collections/${artwork.collectionSlug}`} className="hover:text-[#A85C43]">
          {collection?.name || artwork.collectionSlug}
        </Link>
        <span>/</span>
        <span className="text-[#161616] font-medium">{artwork.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery / Mockups Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Display */}
          <div className="relative rounded overflow-hidden shadow-2xl border border-[#161616]/10 bg-[#161616]/5">
            <WatermarkImage
              src={activeImage}
              alt={artwork.title}
              aspectRatio={artwork.orientation === "Landscape" ? "landscape" : artwork.orientation === "Square" ? "square" : "portrait"}
              showWatermark={showWatermark}
            />

            {/* Reference Badge */}
            <div className="absolute top-4 left-4 bg-[#161616]/90 text-[#FAF7F2] text-xs font-mono tracking-widest px-3 py-1.5 rounded backdrop-blur border border-[#B5965A]/40 uppercase shadow">
              REF: {artwork.refCode}
            </div>

            {/* Watermark Toggle Trigger */}
            <button
              onClick={() => setShowWatermark(!showWatermark)}
              className="absolute bottom-4 right-4 bg-[#161616]/80 hover:bg-[#161616] text-[#FAF7F2] text-[10px] font-sans tracking-widest px-3 py-1.5 rounded backdrop-blur border border-[#FAF7F2]/20 uppercase transition-colors"
            >
              {showWatermark ? "Hide ARTÉVO Watermark" : "Show ARTÉVO Watermark"}
            </button>
          </div>

          {/* Thumbnails Row */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {imagesList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`relative w-20 h-20 rounded border-2 overflow-hidden flex-shrink-0 transition-all ${
                    activeImage === imgUrl ? "border-[#A85C43] ring-2 ring-[#A85C43]/30 scale-105" : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Story & Concept Narrative */}
          <div className="bg-[#FAF7F2] p-8 rounded border border-[#161616]/10 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#A85C43] font-semibold">
              <Sparkles className="w-4 h-4" /> Curatorial Concept & Story
            </div>
            <h3 className="font-serif text-2xl text-[#161616]">{artwork.title}</h3>
            <p className="text-sm text-[#161616]/80 leading-relaxed font-sans font-light whitespace-pre-line">
              {artwork.story}
            </p>
            <div className="pt-4 border-t border-[#161616]/10 grid grid-cols-2 gap-4 text-xs text-[#B7AEA2]">
              <div>
                <span className="font-semibold text-[#161616] block">Master Artist</span>
                {artwork.artist}
              </div>
              <div>
                <span className="font-semibold text-[#161616] block">Collection Series</span>
                {collection?.name || artwork.collectionSlug}
              </div>
            </div>
          </div>
        </div>

        {/* Purchase & Artwork Specifications (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FAF7F2] p-8 rounded border border-[#161616]/15 shadow-lg space-y-8 sticky top-28">
          <div>
            <div className="flex items-center justify-between text-xs text-[#B5965A] uppercase tracking-widest font-medium mb-2">
              <span>{artwork.editionType}</span>
              <span className="font-mono text-[#B7AEA2]">{artwork.refCode}</span>
            </div>
            <h1 className="font-serif text-3xl text-[#161616] font-medium leading-tight">{artwork.title}</h1>
            <p className="text-xs text-[#B7AEA2] mt-1 font-sans">by {artwork.artist}</p>
          </div>

          {/* Pricing Row */}
          <div className="p-4 bg-[#161616] text-[#FAF7F2] rounded flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2] block">
                {artwork.auctionEnabled ? "Current Top Bid" : "Investment Value"}
              </span>
              <span className="font-serif text-2xl font-bold text-[#FAF7F2]">
                ₦{(artwork.auctionEnabled ? (artwork.currentHighestBid || calculatedPrice) : calculatedPrice).toLocaleString()}
              </span>
            </div>
            <div className="text-right text-[11px] text-[#B5965A] uppercase tracking-wider">
              {artwork.auctionEnabled ? "Live Bidding Active" : "Archival Frame Included"}
            </div>
          </div>

          {/* Size Options */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#161616] flex items-center justify-between">
              <span>Select Dimensions & Scale</span>
              <span className="text-[10px] text-[#B5965A] font-normal">{selectedSize.dimensions}</span>
            </label>
            <div className="space-y-2">
              {sizesList.map((sizeOpt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSize(sizeOpt)}
                  className={`w-full p-3 rounded border text-left flex items-center justify-between text-xs transition-all ${
                    selectedSize.size === sizeOpt.size
                      ? "border-[#A85C43] bg-[#A85C43]/10 text-[#161616] font-medium shadow-sm"
                      : "border-[#161616]/15 hover:border-[#A85C43]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedSize.size === sizeOpt.size ? "border-[#A85C43] bg-[#A85C43]" : "border-gray-400"}`}>
                      {selectedSize.size === sizeOpt.size && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span>{sizeOpt.size}</span>
                  </div>
                  <span className="font-serif font-semibold">₦{sizeOpt.price.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Framing Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#161616]">
              Handcrafted Framing Style
            </label>
            <div className="grid grid-cols-1 gap-2">
              {framesList.map((frame, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFrame(frame)}
                  className={`w-full p-3 rounded border text-left text-xs transition-all flex items-center gap-2 ${
                    selectedFrame === frame
                      ? "border-[#B5965A] bg-[#B5965A]/10 text-[#161616] font-medium shadow-sm"
                      : "border-[#161616]/15 hover:border-[#B5965A]"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedFrame === frame ? "border-[#B5965A] bg-[#B5965A]" : "border-gray-400"}`}>
                    {selectedFrame === frame && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span>{frame}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Order / Bid Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              href={`/order?artRef=${artwork.refCode}&size=${encodeURIComponent(selectedSize.size)}&frame=${encodeURIComponent(selectedFrame)}&amount=${calculatedPrice}`}
              className="w-full py-4 bg-[#A85C43] text-[#FAF7F2] rounded font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#874632] transition-colors shadow-xl"
            >
              <ShoppingBag className="w-4 h-4" /> Get this Piece (₦{calculatedPrice.toLocaleString()})
            </Link>

            {artwork.auctionEnabled && (
              <button
                id="auction"
                onClick={() => setShowAuctionModal(true)}
                className="w-full py-3.5 bg-[#161616] text-[#FAF7F2] border border-[#B5965A] rounded font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#B5965A] hover:text-[#161616] transition-colors shadow-md"
              >
                <Gavel className="w-4 h-4 text-[#B5965A]" /> Bid for this Piece
              </button>
            )}
          </div>

          {/* Verification & Direct Bank Guarantee */}
          <div className="pt-4 border-t border-[#161616]/10 space-y-2 text-[11px] text-[#B7AEA2]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B5965A]" />
              <span>Direct official bank transfer checkout with order tracking.</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#B5965A]" />
              <span>Includes Certificate of Authenticity & ARTÉVO embossed seal.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auction Modal */}
      {showAuctionModal && (
        <div className="fixed inset-0 z-50 bg-[#161616]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] w-full max-w-lg rounded-lg shadow-2xl overflow-hidden border border-[#B5965A] p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#161616]/10 pb-4">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-[#A85C43]" />
                <h3 className="font-serif text-xl text-[#161616]">Place Auction Bid</h3>
              </div>
              <button onClick={() => setShowAuctionModal(false)} className="text-[#161616]/60 hover:text-[#161616] text-sm">✕</button>
            </div>

            {biddingSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl text-[#161616]">Bid Received Successfully!</h4>
                <p className="text-xs text-[#B7AEA2]">
                  Your bid of <strong className="text-[#161616]">₦{bidAmount.toLocaleString()}</strong> for {artwork.title} has been recorded on the ARTÉVO ledger. Our curatorial desk will notify you if outbid or upon auction close.
                </p>
                <button
                  onClick={() => { setShowAuctionModal(false); setBiddingSuccess(false); }}
                  className="bg-[#161616] text-[#FAF7F2] text-xs uppercase tracking-widest px-6 py-2.5 rounded"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handlePlaceBid} className="space-y-4 text-xs">
                <div className="p-3 bg-[#161616] text-[#FAF7F2] rounded flex justify-between items-center">
                  <span>Current Highest Bid:</span>
                  <span className="font-serif font-bold text-base text-[#B5965A]">
                    ₦{(artwork.currentHighestBid || artwork.minBid || artwork.price).toLocaleString()}
                  </span>
                </div>

                {biddingError && <div className="p-2 bg-red-100 text-red-700 rounded">{biddingError}</div>}

                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Your Bid Amount (Naira ₦)</label>
                  <input
                    type="number"
                    min={(artwork.currentHighestBid || artwork.minBid || artwork.price) + (artwork.bidIncrement || 50)}
                    step={artwork.bidIncrement || 50}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    required
                    className="w-full p-3 border border-[#161616]/20 rounded bg-white font-serif text-base text-[#161616] focus:outline-none focus:border-[#A85C43]"
                  />
                  <span className="text-[10px] text-[#B7AEA2] mt-1 block">
                    Minimum increment is +₦{artwork.bidIncrement || 50}.
                  </span>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={bidderName}
                    onChange={(e) => setBidderName(e.target.value)}
                    required
                    placeholder="Collector or Representative Name"
                    className="w-full p-3 border border-[#161616]/20 rounded bg-white text-[#161616]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={bidderEmail}
                    onChange={(e) => setBidderEmail(e.target.value)}
                    required
                    placeholder="collector@domain.com"
                    className="w-full p-3 border border-[#161616]/20 rounded bg-white text-[#161616]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={bidderPhone}
                    onChange={(e) => setBidderPhone(e.target.value)}
                    placeholder="+1 212 555 0192"
                    className="w-full p-3 border border-[#161616]/20 rounded bg-white text-[#161616]"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAuctionModal(false)}
                    className="px-4 py-3 border border-[#161616]/30 text-[#161616] rounded uppercase tracking-wider font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBid}
                    className="px-6 py-3 bg-[#A85C43] text-[#FAF7F2] rounded uppercase tracking-wider font-semibold hover:bg-[#874632] transition-colors"
                  >
                    {isSubmittingBid ? "Submitting Bid..." : "Submit Official Bid"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Related Artworks */}
      {related.length > 0 && (
        <section className="mt-20 pt-12 border-t border-[#161616]/10">
          <h2 className="font-serif text-2xl text-[#161616] mb-8">More Works from {collection?.name || "this Collection"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((art) => (
              <div key={art.id} className="bg-[#FAF7F2] border border-[#161616]/10 p-4 rounded">
                <Link href={`/artwork/${art.slug}`}>
                  <img src={art.image} alt={art.title} className="w-full h-48 object-cover rounded mb-3" />
                  <span className="text-[10px] uppercase text-[#B5965A] block">{art.refCode}</span>
                  <h3 className="font-serif text-base text-[#161616] hover:text-[#A85C43] font-medium">{art.title}</h3>
                  <p className="text-xs font-semibold text-[#161616] mt-1">₦{art.price.toLocaleString()}</p>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
