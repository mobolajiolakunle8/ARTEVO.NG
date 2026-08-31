"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useLiveSync } from "@/components/useWishlist";
import {
  Search,
  PackageCheck,
  Clock,
  CheckCircle2,
  Truck,
  Building,
  ShieldCheck,
  ExternalLink,
  MapPin
} from "lucide-react";

interface TrackOrderClientProps {
  initialOrder: any;
  initialRef: string;
}

export default function TrackOrderClient({ initialOrder, initialRef }: TrackOrderClientProps) {
  const [orderRefInput, setOrderRefInput] = useState(initialRef);
  const [emailInput, setEmailInput] = useState("");
  const [order, setOrder] = useState<any>(initialOrder);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Live sync: when the admin verifies/advances this order in any browser, refetch it here.
  const refetch = useCallback(async () => {
    const ref = order?.orderRef || orderRefInput;
    if (!ref) return;
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef: ref }),
      });
      const data = await res.json();
      if (res.ok && data.order) setOrder(data.order);
    } catch { /* silent */ }
  }, [order, orderRefInput]);
  useLiveSync(["orders"], refetch);

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRef: orderRefInput,
          email: emailInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order not found");
      }

      setOrder(data.order);
    } catch (err: any) {
      setErrorMsg(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: "Payment Pending", title: "Order Created", desc: "Order reference code issued" },
    { key: "Payment Submitted", title: "Payment Submitted", desc: "Bank transfer reference uploaded" },
    { key: "Paid", title: "Payment Verified", desc: "Admin deposit verification complete" },
    { key: "Processing & Framing", title: "Framing & Inspection", desc: "Hardwood framing and archival seal" },
    { key: "Dispatched", title: "White-Glove Courier", desc: "Crated for insured global transit" },
    { key: "Delivered", title: "Delivered to Collector", desc: "Successfully delivered and mounted" },
  ];

  const getStepIndex = (statusStr: string) => {
    switch (statusStr) {
      case "Payment Pending": return 0;
      case "Payment Submitted": return 1;
      case "Paid": return 2;
      case "Processing & Framing": return 3;
      case "Dispatched": return 4;
      case "Delivered": return 5;
      default: return 0;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.status) : -1;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#B5965A] font-semibold">Real-Time Concierge Tracking</span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#161616]">Track Your ARTÉVO Order</h1>
        <p className="text-xs text-[#B7AEA2] max-w-lg mx-auto">
          Enter your unique Order Reference Code (e.g. ARTEVO-ORD-8942) to check verification, framing, and delivery status.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleTrackSearch} className="bg-[#FAF7F2] border border-[#161616]/15 p-6 rounded shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#161616] mb-1 font-medium">Order Reference Code *</label>
            <input
              type="text"
              required
              value={orderRefInput}
              onChange={(e) => setOrderRefInput(e.target.value)}
              placeholder="ARTEVO-ORD-8942"
              className="w-full p-3 border border-[#161616]/20 rounded font-mono uppercase text-xs text-[#161616]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#161616] mb-1 font-medium">Email (Optional)</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="collector@domain.com"
              className="w-full p-3 border border-[#161616]/20 rounded text-xs text-[#161616]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#161616] text-[#FAF7F2] rounded text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#A85C43] transition-colors flex items-center justify-center gap-2 shadow"
        >
          {loading ? "Locating Order..." : "Search Order Ledger"} <Search className="w-4 h-4" />
        </button>
      </form>

      {errorMsg && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 text-xs rounded text-center">
          {errorMsg}
        </div>
      )}

      {/* Order Status Display */}
      {order && (
        <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded p-8 shadow-xl space-y-8">
          <div className="flex flex-wrap items-center justify-between border-b border-[#161616]/10 pb-6 gap-4">
            <div>
              <span className="text-[10px] font-mono text-[#B5965A] uppercase tracking-widest block">Reference Code</span>
              <h2 className="font-serif text-2xl text-[#161616] font-bold">{order.orderRef}</h2>
              <p className="text-xs text-[#B7AEA2] mt-0.5">Placed by {order.customerName} on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2] block">Current Status</span>
              <span className="inline-block px-3 py-1 bg-[#A85C43] text-[#FAF7F2] rounded font-semibold text-xs mt-1">
                {order.status}
              </span>
            </div>
          </div>

          {/* Timeline Visualizer */}
          <div className="space-y-6">
            <h3 className="font-serif text-lg text-[#161616]">Order Fulfillment Timeline</h3>
            
            <div className="relative pl-6 border-l-2 border-[#161616]/15 space-y-6">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step.key} className="relative group">
                    <div
                      className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? "bg-[#A85C43] text-[#FAF7F2] shadow-md"
                          : "bg-gray-200 text-gray-400"
                      } ${isCurrent ? "ring-4 ring-[#A85C43]/30 scale-110" : ""}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-serif font-medium ${isPassed ? "text-[#161616]" : "text-[#B7AEA2]"}`}>
                          {step.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] uppercase tracking-widest bg-[#B5965A] text-white px-2 py-0.5 rounded font-mono">
                            Current Stage
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#B7AEA2] mt-0.5 font-light">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Summary */}
          <div className="pt-6 border-t border-[#161616]/10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <span className="font-semibold text-[#161616] uppercase tracking-wider block">Artwork Spec</span>
              <div className="p-3 bg-[#161616]/5 rounded space-y-1">
                <p className="font-serif text-sm text-[#161616] font-medium">{order.artworkTitle}</p>
                <p className="text-[11px] text-[#B7AEA2]">REF: {order.artworkRef}</p>
                <p className="text-[11px] text-[#B7AEA2]">{order.selectedSize}</p>
                <p className="text-[11px] text-[#B7AEA2]">{order.selectedFraming}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-[#161616] uppercase tracking-wider block">Delivery Destination</span>
              <div className="p-3 bg-[#161616]/5 rounded space-y-1">
                <p className="text-[#161616] font-medium">{order.customerName}</p>
                <p className="text-[11px] text-[#B7AEA2]">{order.shippingAddress}, {order.country}</p>
                <p className="text-[11px] text-[#B7AEA2]">Payment Reference: {order.paymentProofRef || "Pending Upload"}</p>
              </div>
            </div>
          </div>

          {order.status === "Payment Pending" && (
            <div className="pt-2 text-center">
              <Link
                href={`/order/payment?orderRef=${order.orderRef}`}
                className="inline-block bg-[#A85C43] text-[#FAF7F2] px-6 py-3 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#874632] transition-colors"
              >
                Upload Payment Reference
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
