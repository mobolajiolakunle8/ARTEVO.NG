"use client";

import { useState } from "react";
import Link from "next/link";
import { firebaseSyncPush } from "@/lib/firebase-sync";
import {
  Building,
  CreditCard,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  AlertCircle
} from "lucide-react";

interface PaymentClientProps {
  order: any;
  bankSettings: any;
}

export default function PaymentClient({ order, bankSettings }: PaymentClientProps) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [proofRef, setProofRef] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofSuccess, setProofSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const bankName = bankSettings?.bankName || "Guaranty Trust Bank (GTBank) / Standard Bank Private";
  const accountName = bankSettings?.accountName || "ARTÉVO GLOBAL LIMITED";
  const accountNumber = bankSettings?.accountNumber || "0192837465 / 9928301182";
  const sortCode = bankSettings?.sortCodeOrSwift || "GTBIGL22 / SBZAZAJJ";
  const instructions = bankSettings?.instructions || "Transfer exact order value and specify your Order Reference Code in the transfer remark.";

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmittedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProof(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/orders/${order.orderRef}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Payment Submitted",
          paymentProofRef: proofRef,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update payment status");
      }

      setCurrentOrder(data.order);
      setProofSuccess(true);
      firebaseSyncPush("orders", "payment-submitted", order.orderRef);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmittingProof(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Order Confirmation Bar */}
      <div className="bg-[#161616] text-[#FAF7F2] p-8 rounded shadow-xl border border-[#B5965A]/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B5965A] block mb-1">
            Order Reference Code
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-widest text-[#FAF7F2]">
            {currentOrder.orderRef}
          </h1>
          <p className="text-xs text-[#B7AEA2] mt-1">
            Saved for {currentOrder.customerName} ({currentOrder.customerEmail})
          </p>
        </div>

        <div className="bg-[#FAF7F2]/10 p-4 rounded border border-[#FAF7F2]/20 text-center md:text-right">
          <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2] block">Amount Due via Bank Transfer</span>
          <span className="font-serif text-3xl font-bold text-[#B5965A]">₦{currentOrder.amount.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Instructions & Bank Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Bank Account Details Card (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FAF7F2] border border-[#161616]/15 p-6 rounded shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#A85C43] font-semibold border-b border-[#161616]/10 pb-3">
            <Building className="w-5 h-5 text-[#B5965A]" /> Official ARTÉVO Transfer Account
          </div>

          <p className="text-xs text-[#161616]/80 leading-relaxed font-light">
            {instructions}
          </p>

          <div className="space-y-3 bg-[#161616]/5 p-4 rounded border border-[#161616]/10 font-mono text-xs">
            {/* Bank Name */}
            <div className="flex items-center justify-between p-2 rounded bg-white border border-[#161616]/10">
              <div>
                <span className="text-[10px] text-[#B7AEA2] uppercase block font-sans">Bank Name</span>
                <span className="font-medium text-[#161616]">{bankName}</span>
              </div>
              <button
                onClick={() => handleCopy(bankName, "bankName")}
                className="p-1.5 text-[#161616]/60 hover:text-[#A85C43]"
                title="Copy"
              >
                {copiedField === "bankName" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Account Name */}
            <div className="flex items-center justify-between p-2 rounded bg-white border border-[#161616]/10">
              <div>
                <span className="text-[10px] text-[#B7AEA2] uppercase block font-sans">Account Beneficiary</span>
                <span className="font-medium text-[#161616]">{accountName}</span>
              </div>
              <button
                onClick={() => handleCopy(accountName, "accountName")}
                className="p-1.5 text-[#161616]/60 hover:text-[#A85C43]"
                title="Copy"
              >
                {copiedField === "accountName" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Account Number */}
            <div className="flex items-center justify-between p-2 rounded bg-white border border-[#161616]/10">
              <div>
                <span className="text-[10px] text-[#B7AEA2] uppercase block font-sans">Account Number</span>
                <span className="font-serif text-base font-bold text-[#A85C43]">{accountNumber}</span>
              </div>
              <button
                onClick={() => handleCopy(accountNumber, "accountNumber")}
                className="p-1.5 text-[#161616]/60 hover:text-[#A85C43]"
                title="Copy"
              >
                {copiedField === "accountNumber" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Sort/Swift */}
            <div className="flex items-center justify-between p-2 rounded bg-white border border-[#161616]/10">
              <div>
                <span className="text-[10px] text-[#B7AEA2] uppercase block font-sans">SWIFT / Sort Code</span>
                <span className="font-medium text-[#161616]">{sortCode}</span>
              </div>
              <button
                onClick={() => handleCopy(sortCode, "sortCode")}
                className="p-1.5 text-[#161616]/60 hover:text-[#A85C43]"
                title="Copy"
              >
                {copiedField === "sortCode" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Payment Memo */}
            <div className="flex items-center justify-between p-2 rounded bg-[#B5965A]/15 border border-[#B5965A]/30">
              <div>
                <span className="text-[10px] text-[#B5965A] uppercase block font-sans font-bold">Transfer Remark / Reference</span>
                <span className="font-bold text-[#161616] font-mono">{currentOrder.orderRef}</span>
              </div>
              <button
                onClick={() => handleCopy(currentOrder.orderRef, "orderRef")}
                className="p-1.5 text-[#161616]/80 hover:text-[#A85C43]"
                title="Copy Memo"
              >
                {copiedField === "orderRef" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Payment Confirmation Action Form (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FAF7F2] border border-[#161616]/15 p-6 rounded shadow-sm space-y-6">
          <div className="border-b border-[#161616]/10 pb-3">
            <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2] block">Current Order Status</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B5965A]/20 text-[#161616] rounded font-semibold text-xs mt-1 border border-[#B5965A]/40">
              <Clock className="w-3.5 h-3.5 text-[#A85C43]" /> {currentOrder.status}
            </div>
          </div>

          {proofSuccess || currentOrder.status === "Payment Submitted" || currentOrder.status === "Paid" ? (
            <div className="bg-[#161616] text-[#FAF7F2] p-6 rounded text-center space-y-4 shadow-lg border border-green-500/40">
              <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/40">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#FAF7F2]">Payment Notification Recorded!</h3>
              <p className="text-xs text-[#B7AEA2]">
                Your payment reference <strong className="text-[#B5965A]">{currentOrder.paymentProofRef || proofRef}</strong> has been logged into the ARTÉVO Admin Studio.
              </p>
              <p className="text-[11px] text-[#FAF7F2]/70">
                Our finance team will verify the bank deposit and transition your order to <span className="text-green-400 font-semibold">Paid</span> and <span className="text-[#B5965A] font-semibold">Processing & Framing</span>.
              </p>
              <div className="pt-2">
                <Link
                  href={`/track-order?orderRef=${currentOrder.orderRef}`}
                  className="inline-flex items-center gap-2 bg-[#A85C43] text-[#FAF7F2] px-6 py-3 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#874632] transition-colors"
                >
                  Track Live Order Progress <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmittedPayment} className="space-y-4">
              <div>
                <h3 className="font-serif text-lg text-[#161616]">“I Have Made Payment”</h3>
                <p className="text-xs text-[#B7AEA2] mt-1 font-light">
                  After initiating your bank transfer, enter your transaction code or bank reference below to alert the ARTÉVO concierge desk.
                </p>
              </div>

              {errorMsg && <div className="p-2 bg-red-100 text-red-700 text-xs rounded">{errorMsg}</div>}

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#161616] mb-1 font-medium">Bank Transfer Reference / Transaction ID *</label>
                <input
                  type="text"
                  required
                  value={proofRef}
                  onChange={(e) => setProofRef(e.target.value)}
                  placeholder="e.g. TRX-GTB-9921038 or Wire Code"
                  className="w-full p-3 border border-[#161616]/20 rounded bg-white font-mono text-xs text-[#161616] focus:outline-none focus:border-[#A85C43]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingProof}
                className="w-full py-4 bg-[#A85C43] text-[#FAF7F2] rounded text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#874632] transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmittingProof ? "Updating Order..." : "I Have Made Payment"} <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-[#161616]/10 text-center">
            <Link
              href={`/track-order?orderRef=${currentOrder.orderRef}`}
              className="text-xs uppercase tracking-widest text-[#B5965A] hover:text-[#A85C43] font-medium flex items-center justify-center gap-1"
            >
              Public Tracking Link <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
