"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageCircle } from "lucide-react";
import { BRAND, whatsappHref } from "@/lib/brand";
import { firebaseSyncPush } from "@/lib/firebase-sync";

export default function ContactClient() {
  const [type, setType] = useState("Residential Curation");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [artworkRef, setArtworkRef] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          email,
          phone,
          company,
          message,
          artworkRef,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setSuccess(true);
      firebaseSyncPush("inquiries", "create", email);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#B5965A] font-semibold">Private Advisory</span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#161616]">Contact ARTÉVO Concierge</h1>
        <p className="text-xs text-[#B7AEA2] max-w-lg mx-auto">
          For custom commissions, commercial project proposals, collector advice, or bank order assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info (4 Cols) */}
        <div className="lg:col-span-4 bg-[#161616] text-[#FAF7F2] p-6 rounded shadow-xl space-y-6">
          <h3 className="font-serif text-xl text-[#FAF7F2] border-b border-[#FAF7F2]/10 pb-3">
            Gallery Studios
          </h3>

          <div className="space-y-4 text-xs text-[#B7AEA2]">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#B5965A] block mb-1">{BRAND.studioLabel}</span>
              <p className="text-[#FAF7F2] font-medium">{BRAND.studioDetail}</p>
              <p>{BRAND.locationLabel}</p>
              <p className="text-[#B5965A] mt-1">Established {BRAND.foundedYear}</p>
            </div>

            <div className="pt-4 border-t border-[#FAF7F2]/10 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B5965A]" />
                <a href={`mailto:${BRAND.email}`} className="text-[#FAF7F2] hover:text-[#B5965A] transition-colors">{BRAND.email}</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B5965A]" />
                <a href={`tel:${BRAND.phoneTel}`} className="text-[#FAF7F2] hover:text-[#B5965A] transition-colors">{BRAND.phoneDisplay}</a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="text-[#FAF7F2] hover:text-[#25D366] transition-colors">
                  WhatsApp {BRAND.whatsappDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form (8 Cols) */}
        <div className="lg:col-span-8 bg-[#FAF7F2] border border-[#161616]/15 p-8 rounded shadow-sm">
          {success ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-[#161616]">Inquiry Received</h3>
              <p className="text-xs text-[#B7AEA2] max-w-md mx-auto">
                Thank you, {name}. An ARTÉVO Chief Curator will review your request and contact you within 24 hours.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 bg-[#161616] text-[#FAF7F2] px-6 py-2.5 rounded text-xs uppercase tracking-widest font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && <div className="p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>}

              <div>
                <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Inquiry Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 border border-[#161616]/20 rounded bg-white text-[#161616]"
                >
                  <option value="Residential Curation">Residential Curation & Framing</option>
                  <option value="Custom Commission">Custom Bespoke Commission</option>
                  <option value="Hospitality & Commercial">Hospitality & Commercial Project</option>
                  <option value="Collector Advisory">Private Collector Advisory</option>
                  <option value="Bank Order Assistance">Order / Bank Payment Inquiry</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full p-3 border border-[#161616]/20 rounded bg-white text-[#161616]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="collector@domain.com"
                    className="w-full p-3 border border-[#161616]/20 rounded bg-white text-[#161616]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full p-3 border border-[#161616]/20 rounded bg-white text-[#161616]"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Artwork Reference Code (Optional)</label>
                  <input
                    type="text"
                    value={artworkRef}
                    onChange={(e) => setArtworkRef(e.target.value)}
                    placeholder="e.g. ART-AFR-001"
                    className="w-full p-3 border border-[#161616]/20 rounded bg-white font-mono uppercase text-[#161616]"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Company / Firm (Optional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Design Firm or Hotel Brand"
                  className="w-full p-3 border border-[#161616]/20 rounded bg-white text-[#161616]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Message / Vision Details *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your space, wall dimensions, preferred colors, or project deadline..."
                  className="w-full p-3 border border-[#161616]/20 rounded bg-white text-[#161616]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#A85C43] text-[#FAF7F2] rounded text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#874632] transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? "Sending Message..." : "Submit Confidential Inquiry"} <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
