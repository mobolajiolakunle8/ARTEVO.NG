"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription failed");
      setStatus("done");
      setMessage(data.alreadySubscribed ? "You're already on the list — thank you." : "Welcome to the ARTÉVO circle.");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <div className="space-y-3">
      <h5 className="font-serif text-xs tracking-widest uppercase text-[#B5965A]">The Collector's Circle</h5>
      <p className="text-[11px] text-[#B7AEA2] leading-relaxed">
        Private previews of new works, limited editions and curator insights — direct to your inbox.
      </p>

      {status === "done" ? (
        <div className="flex items-center gap-2 text-xs text-[#B5965A] bg-[#FAF7F2]/5 border border-[#B5965A]/30 rounded px-3 py-2.5">
          <Check className="w-4 h-4" /> {message}
        </div>
      ) : (
        <form onSubmit={submit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B7AEA2]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full bg-[#FAF7F2]/5 border border-[#FAF7F2]/15 rounded pl-9 pr-3 py-2.5 text-xs text-[#FAF7F2] placeholder:text-[#B7AEA2] focus:outline-none focus:border-[#B5965A]"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-[#A85C43] text-[#FAF7F2] text-[11px] uppercase tracking-wider font-semibold px-4 py-2.5 rounded hover:bg-[#874632] transition-colors flex items-center gap-1.5 shrink-0"
          >
            {status === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Join"}
          </button>
        </form>
      )}
      {status === "error" && <p className="text-[11px] text-red-400">{message}</p>}
    </div>
  );
}
