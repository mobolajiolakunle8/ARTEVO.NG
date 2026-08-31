"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WatermarkImage from "@/components/WatermarkImage";
import { useLiveSync } from "@/components/useWishlist";
import { firebaseSyncPush } from "@/lib/firebase-sync";
import { Gavel, Clock, Trophy, Eye, Check, ShieldCheck, ArrowRight, Radio } from "lucide-react";

interface AuctionRoomClientProps {
  auctions: any[];
}

export default function AuctionRoomClient({ auctions }: AuctionRoomClientProps) {
  const router = useRouter();
  const [liveBadge, setLiveBadge] = useState(false);
  const [selectedArt, setSelectedArt] = useState<any>(null);

  // Cross-browser: any new bid placed anywhere refreshes this page's data.
  useLiveSync(["auctions", "artworks"], () => {
    setLiveBadge(true);
    router.refresh();
    setTimeout(() => setLiveBadge(false), 2000);
  });
  const [bidderName, setBidderName] = useState("");
  const [bidderEmail, setBidderEmail] = useState("");
  const [bidderPhone, setBidderPhone] = useState("");
  const [amountInput, setAmountInput] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const openBidModal = (art: any) => {
    setSelectedArt(art);
    const minReq = (art.currentHighestBid || art.minBid || art.price) + (art.bidIncrement || 50);
    setAmountInput(minReq);
    setBidSuccess(false);
    setErrorMsg("");
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArt) return;
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auctions/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: selectedArt.id,
          bidderName,
          bidderEmail,
          bidderPhone,
          amount: Number(amountInput),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit bid");
      }

      setBidSuccess(true);
      firebaseSyncPush("auctions", "bid", selectedArt?.slug);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="bg-[#161616] text-[#FAF7F2] p-10 rounded border border-[#B5965A]/40 text-center space-y-4 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#FAF7F2]/10 rounded-full border border-[#B5965A]/30 text-[#B5965A] text-xs uppercase tracking-widest">
          <Gavel className="w-3.5 h-3.5" /> Private Bidding Room
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#FAF7F2] flex items-center justify-center gap-3">
          ARTÉVO Live Auctions
          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border transition-all ${liveBadge ? "border-emerald-400 bg-emerald-400/20 text-emerald-300" : "border-[#B5965A]/40 text-[#B5965A]"}`}>
            <Radio className={`w-3 h-3 ${liveBadge ? "animate-pulse" : ""}`} /> Live
          </span>
        </h1>
        <p className="font-serif italic text-base sm:text-lg text-[#B7AEA2] max-w-2xl mx-auto font-normal">
          Direct acquisition for rare monotypes and featured masterworks. Place confidential bids verified by ARTÉVO Curatorial Desk.
        </p>
      </div>

      {/* Active Auctions Grid */}
      {auctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {auctions.map((art) => {
            const currentBid = art.currentHighestBid || art.minBid || art.price;
            const minNextBid = currentBid + (art.bidIncrement || 50);

            return (
              <div
                key={art.id}
                className="bg-[#FAF7F2] border border-[#161616]/15 rounded-sm overflow-hidden flex flex-col justify-between shadow-lg hover:border-[#A85C43] transition-all"
              >
                <div className="relative">
                  <WatermarkImage
                    src={art.image}
                    alt={art.title}
                    aspectRatio="landscape"
                    showWatermark={art.watermarkEnabled !== false}
                  />

                  <div className="absolute top-3 left-3 bg-[#161616]/90 text-[#FAF7F2] text-[10px] font-mono tracking-widest px-2.5 py-1 rounded backdrop-blur border border-[#B5965A]/40">
                    REF: {art.refCode}
                  </div>

                  <div className="absolute top-3 right-3 bg-[#A85C43] text-[#FAF7F2] text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded flex items-center gap-1 shadow">
                    <Clock className="w-3 h-3" /> Live Auction
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-[#B5965A] uppercase tracking-widest mb-1">
                      <span>{art.collectionSlug.replace("-", " ")}</span>
                      <span>{art.editionType}</span>
                    </div>

                    <h3 className="font-serif text-2xl text-[#161616] font-medium">{art.title}</h3>
                    <p className="text-xs text-[#B7AEA2] mt-0.5">by {art.artist}</p>
                    <p className="text-xs text-[#161616]/75 mt-3 line-clamp-2 leading-relaxed font-light">{art.story}</p>
                  </div>

                  {/* Bidding Bar */}
                  <div className="p-4 bg-[#161616] text-[#FAF7F2] rounded flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2] block">Current Highest Bid</span>
                      <span className="font-serif text-2xl font-bold text-[#B5965A]">₦{currentBid.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2] block">Bids Placed</span>
                      <span className="text-xs font-mono font-semibold text-[#FAF7F2]">{art.bidCount} Bids</span>
                    </div>
                  </div>

                  {/* Recent Bid History Sample */}
                  {art.bids && art.bids.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2] font-semibold block">Top Bidder History</span>
                      <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[11px] bg-[#161616]/5 p-2 rounded">
                        {art.bids.slice(0, 3).map((b: any) => (
                          <div key={b.id} className="flex items-center justify-between text-[#161616]/80">
                            <span>{b.bidderName.slice(0, 1)}*** ({new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                            <span className="font-semibold text-[#A85C43]">₦{b.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Row */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => openBidModal(art)}
                      className="flex-1 py-3 bg-[#A85C43] text-[#FAF7F2] rounded text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#874632] transition-colors flex items-center justify-center gap-2 shadow"
                    >
                      <Gavel className="w-4 h-4" /> Place Official Bid
                    </button>
                    <Link
                      href={`/artwork/${art.slug}`}
                      className="p-3 border border-[#161616]/20 rounded text-[#161616] hover:bg-[#161616]/5 transition-colors"
                      title="View Full Spec"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <h3 className="font-serif text-2xl text-[#161616]">No Active Auctions Right Now</h3>
          <p className="text-xs text-[#B7AEA2]">All auction pieces have closed. Browse our curated artwork catalog for direct orders.</p>
          <Link
            href="/artwork"
            className="inline-block bg-[#161616] text-[#FAF7F2] px-8 py-3 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#A85C43] transition-colors"
          >
            Browse Collections
          </Link>
        </div>
      )}

      {/* Bidding Modal */}
      {selectedArt && (
        <div className="fixed inset-0 z-50 bg-[#161616]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] w-full max-w-lg rounded-lg shadow-2xl overflow-hidden border border-[#B5965A] p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#161616]/10 pb-4">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-[#A85C43]" />
                <h3 className="font-serif text-xl text-[#161616]">Place Auction Bid</h3>
              </div>
              <button onClick={() => setSelectedArt(null)} className="text-[#161616]/60 hover:text-[#161616] text-sm">✕</button>
            </div>

            {bidSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl text-[#161616]">Bid Recorded!</h4>
                <p className="text-xs text-[#B7AEA2]">
                  Your bid of <strong className="text-[#161616]">₦{amountInput.toLocaleString()}</strong> for {selectedArt.title} has been logged.
                </p>
                <button
                  onClick={() => setSelectedArt(null)}
                  className="bg-[#161616] text-[#FAF7F2] text-xs uppercase tracking-widest px-6 py-2.5 rounded"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handlePlaceBid} className="space-y-4 text-xs">
                <div className="p-3 bg-[#161616] text-[#FAF7F2] rounded flex justify-between items-center">
                  <span>Artwork:</span>
                  <span className="font-serif font-bold text-sm text-[#B5965A]">{selectedArt.title} ({selectedArt.refCode})</span>
                </div>

                {errorMsg && <div className="p-2 bg-red-100 text-red-700 rounded">{errorMsg}</div>}

                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Your Bid Amount (Naira ₦)</label>
                  <input
                    type="number"
                    min={(selectedArt.currentHighestBid || selectedArt.minBid || selectedArt.price) + (selectedArt.bidIncrement || 50)}
                    step={selectedArt.bidIncrement || 50}
                    value={amountInput}
                    onChange={(e) => setAmountInput(Number(e.target.value))}
                    required
                    className="w-full p-3 border border-[#161616]/20 rounded bg-white font-serif text-base text-[#161616]"
                  />
                  <span className="text-[10px] text-[#B7AEA2] mt-1 block">
                    Must be at least +₦{selectedArt.bidIncrement || 50} higher than current bid.
                  </span>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={bidderName}
                    onChange={(e) => setBidderName(e.target.value)}
                    required
                    placeholder="Collector or Firm Name"
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
                    onClick={() => setSelectedArt(null)}
                    className="px-4 py-3 border border-[#161616]/30 text-[#161616] rounded uppercase tracking-wider font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-[#A85C43] text-[#FAF7F2] rounded uppercase tracking-wider font-semibold hover:bg-[#874632] transition-colors"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Bid"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
