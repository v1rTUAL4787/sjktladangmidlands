"use client";

import { MobilePage } from "@/components/superapp/MobilePage";
import { useState } from "react";
import { Phone, Mail, Printer, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setStatus(res.ok ? "done" : "error");
  }

  return (
    <MobilePage title="Contact School" color="bg-[#0f7a94]">
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
          <h2 className="font-bold text-[#1B3A6B] text-base">SJKT Ladang Midlands</h2>
          <a href="tel:0355103239" className="flex items-center gap-3 text-sm text-gray-700 active:opacity-60">
            <div className="w-9 h-9 rounded-full bg-[#00A0C0]/10 flex items-center justify-center">
              <Phone className="h-4 w-4 text-[#00A0C0]" />
            </div>
            03-5510 3239
          </a>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="w-9 h-9 rounded-full bg-[#00A0C0]/10 flex items-center justify-center">
              <Printer className="h-4 w-4 text-[#00A0C0]" />
            </div>
            03-5510 1745
          </div>
          <a href="mailto:BBD8463@moe.edu.my" className="flex items-center gap-3 text-sm text-gray-700 active:opacity-60">
            <div className="w-9 h-9 rounded-full bg-[#00A0C0]/10 flex items-center justify-center">
              <Mail className="h-4 w-4 text-[#00A0C0]" />
            </div>
            BBD8463@moe.edu.my
          </a>
          <div className="flex items-start gap-3 text-sm text-gray-700">
            <div className="w-9 h-9 rounded-full bg-[#00A0C0]/10 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-[#00A0C0]" />
            </div>
            <span>Jalan Plumbum 7/100,<br />40000 Shah Alam, Selangor</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-[#1B3A6B] text-base mb-4">Send an Enquiry</h2>
          {status === "done" ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-semibold text-gray-700">Message Sent!</p>
              <p className="text-gray-400 text-sm mt-1">We'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0C0]" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <input type="email" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0C0]" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0C0]" placeholder="Phone number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <textarea className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0C0] resize-none" rows={4} placeholder="Your message..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
              {status === "error" && <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>}
              <button type="submit" disabled={status === "loading"}
                className="w-full bg-[#0f7a94] text-white rounded-xl py-3 font-semibold text-sm active:opacity-80 disabled:opacity-50 mt-1">
                {status === "loading" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </MobilePage>
  );
}
