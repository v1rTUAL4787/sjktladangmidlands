"use client";

import { MobilePage } from "@/components/superapp/MobilePage";
import { useState } from "react";
import { Heart } from "lucide-react";

const PURPOSES = ["School Development Fund", "Library Books", "Sports Equipment", "Computer Lab", "Canteen Upgrade", "Other"];
const AMOUNTS = [10, 20, 50, 100, 200, 500];

export default function DonatePage() {
  const [form, setForm] = useState({ name: "", email: "", amount: "", customAmount: "", purpose: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const finalAmount = form.customAmount || form.amount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!finalAmount) return;
    setStatus("loading");
    const res = await fetch("/api/donate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(finalAmount) }),
    });
    setStatus(res.ok ? "done" : "error");
  }

  return (
    <MobilePage title="Donate" color="bg-rose-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {status === "done" ? (
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
              <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
            </div>
            <p className="font-bold text-[#1B3A6B] text-lg">Thank You!</p>
            <p className="text-gray-400 text-sm">Your generous donation supports our school community.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-[#1B3A6B] font-bold text-base mb-1">Your Details</p>
            <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <input type="email" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />

            <p className="text-[#1B3A6B] font-bold text-base mt-2 mb-1">Donation Amount (RM)</p>
            <div className="grid grid-cols-3 gap-2">
              {AMOUNTS.map(a => (
                <button type="button" key={a}
                  onClick={() => setForm(f => ({ ...f, amount: String(a), customAmount: "" }))}
                  className={`rounded-xl py-2.5 text-sm font-semibold border transition-colors ${form.amount === String(a) && !form.customAmount ? "bg-rose-500 text-white border-rose-500" : "border-gray-200 text-gray-600 bg-white"}`}>
                  RM {a}
                </button>
              ))}
            </div>
            <input type="number" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="Or enter custom amount (RM)" value={form.customAmount} onChange={e => setForm(f => ({ ...f, customAmount: e.target.value, amount: "" }))} min="1" />

            <p className="text-[#1B3A6B] font-bold text-base mt-2 mb-1">Purpose</p>
            <select className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} required>
              <option value="">Select purpose</option>
              {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <textarea className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" rows={2} placeholder="Message (optional)" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
            {status === "error" && <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>}
            <button type="submit" disabled={status === "loading" || !finalAmount}
              className="w-full bg-rose-500 text-white rounded-xl py-3 font-bold text-sm active:opacity-80 disabled:opacity-50 mt-1">
              {status === "loading" ? "Submitting..." : `Donate${finalAmount ? ` RM ${finalAmount}` : ""}`}
            </button>
            <p className="text-xs text-gray-300 text-center">Payment processing will be configured separately.</p>
          </form>
        )}
      </div>
    </MobilePage>
  );
}
