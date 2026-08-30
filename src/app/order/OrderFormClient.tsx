"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowRight, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

interface OrderFormClientProps {
  preSelectedArt: any;
  preSize?: string;
  preFrame?: string;
  preAmount?: number | null;
  allArtworks: any[];
}

export default function OrderFormClient({
  preSelectedArt,
  preSize,
  preFrame,
  preAmount,
  allArtworks,
}: OrderFormClientProps) {
  const router = useRouter();
  const [selectedArtRef, setSelectedArtRef] = useState<string>(preSelectedArt?.refCode || allArtworks[0]?.refCode || "");
  
  const currentArt = allArtworks.find((a) => a.refCode === selectedArtRef) || preSelectedArt || allArtworks[0];

  const [selectedSize, setSelectedSize] = useState<string>(preSize || "Medium (24 × 36 in)");
  const [selectedFraming, setSelectedFraming] = useState<string>(preFrame || "Obsidian Ebonized Hardwood Frame");
  const [amount, setAmount] = useState<number>(preAmount || currentArt?.price || 1200);

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleArtChange = (refCode: string) => {
    setSelectedArtRef(refCode);
    const found = allArtworks.find((a) => a.refCode === refCode);
    if (found) {
      setAmount(found.price);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: currentArt?.id,
          artworkTitle: currentArt?.title || "Contemporary Artwork",
          artworkRef: currentArt?.refCode || selectedArtRef,
          selectedSize,
          selectedFraming,
          amount,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          country,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // Redirect to payment instructions page with generated orderRef
      router.push(`/order/payment?orderRef=${data.order.orderRef}`);
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="border-b border-[#161616]/10 pb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-[#A85C43] font-semibold block mb-1">
          Private Acquisition
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#161616]">Acquire Artwork</h1>
        <p className="text-xs text-[#B7AEA2] mt-2 font-sans">
          Step 1 of 2: Confirm artwork details and delivery address. Manual bank instructions will follow.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 text-xs rounded">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Artwork Selection Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-[#161616] text-[#FAF7F2] p-6 rounded shadow-xl space-y-6">
          <h2 className="font-serif text-xl text-[#FAF7F2] border-b border-[#FAF7F2]/10 pb-3 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#B5965A]" /> Artwork Reference
          </h2>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#B5965A] mb-1 font-mono">Select Piece</label>
            <select
              value={selectedArtRef}
              onChange={(e) => handleArtChange(e.target.value)}
              className="w-full p-3 bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 text-[#FAF7F2] rounded text-xs focus:outline-none focus:border-[#B5965A]"
            >
              {allArtworks.map((a) => (
                <option key={a.id} value={a.refCode} className="bg-[#161616] text-[#FAF7F2]">
                  [{a.refCode}] {a.title} — ₦{a.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {currentArt && (
            <div className="flex items-center gap-4 p-3 bg-[#FAF7F2]/5 rounded border border-[#FAF7F2]/10">
              <img src={currentArt.image} alt={currentArt.title} className="w-20 h-20 object-cover rounded" />
              <div>
                <span className="text-[10px] font-mono text-[#B5965A]">{currentArt.refCode}</span>
                <h3 className="font-serif text-base text-[#FAF7F2] font-medium">{currentArt.title}</h3>
                <p className="text-xs text-[#B7AEA2]">by {currentArt.artist}</p>
              </div>
            </div>
          )}

          {/* Size Choice */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#B5965A] mb-1">Dimensions</label>
            <input
              type="text"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              required
              className="w-full p-2.5 bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 text-[#FAF7F2] rounded text-xs"
            />
          </div>

          {/* Framing Choice */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#B5965A] mb-1">Archival Framing</label>
            <input
              type="text"
              value={selectedFraming}
              onChange={(e) => setSelectedFraming(e.target.value)}
              required
              className="w-full p-2.5 bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 text-[#FAF7F2] rounded text-xs"
            />
          </div>

          {/* Total Price */}
          <div className="pt-4 border-t border-[#FAF7F2]/10 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#B7AEA2]">Total Order Value:</span>
            <span className="font-serif text-2xl font-bold text-[#B5965A]">₦{amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Right Column: Customer Details Form (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FAF7F2] border border-[#161616]/15 p-6 rounded shadow-sm space-y-6">
          <h2 className="font-serif text-xl text-[#161616] border-b border-[#161616]/10 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#A85C43]" /> Customer & Delivery Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#161616] mb-1 font-medium">Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Dr. Olayinka Sanusi"
                className="w-full p-3 border border-[#161616]/20 rounded bg-white text-xs text-[#161616]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#161616] mb-1 font-medium">Email Address *</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="collector@domain.com"
                className="w-full p-3 border border-[#161616]/20 rounded bg-white text-xs text-[#161616]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#161616] mb-1 font-medium">Phone Number *</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+234 803 123 4567"
                className="w-full p-3 border border-[#161616]/20 rounded bg-white text-xs text-[#161616]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#161616] mb-1 font-medium">Destination Country *</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Nigeria, UK, USA, France..."
                className="w-full p-3 border border-[#161616]/20 rounded bg-white text-xs text-[#161616]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#161616] mb-1 font-medium">Full Shipping / Delivery Address *</label>
            <textarea
              required
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="12 Ring Road, Ibadan, Oyo State"
              className="w-full p-3 border border-[#161616]/20 rounded bg-white text-xs text-[#161616]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#161616] mb-1 font-medium">Framing or Delivery Special Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Include physical Certificate of Authenticity in gift packaging."
              className="w-full p-3 border border-[#161616]/20 rounded bg-white text-xs text-[#161616]"
            />
          </div>

          <div className="pt-4 border-t border-[#161616]/10 flex items-center justify-between">
            <span className="text-[11px] text-[#B7AEA2] flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#B5965A]" /> Bank Transfer Order Code Generated
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#A85C43] text-[#FAF7F2] px-8 py-3.5 rounded text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#874632] transition-colors flex items-center gap-2 shadow-lg"
            >
              {isSubmitting ? "Generating Order..." : "Proceed to Bank Details"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
