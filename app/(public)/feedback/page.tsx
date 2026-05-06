"use client";

import { MobilePage } from "@/components/superapp/MobilePage";
import { useState } from "react";
import { MessageSquare } from "lucide-react";

const CATEGORIES = ["Teaching Quality", "School Facilities", "Communication", "Safety", "Canteen", "Events", "General"];

export default function FeedbackPage() {
  const [form, setForm] = useState({ name: "", message: "", category: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setStatus(res.ok ? "done" : "error");
  }

  return (
    <MobilePage title="Feedback" color="bg-[#00A0C0]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {status === "done" ? (
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-[#00A0C0]/10 flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-[#00A0C0]" />
            </div>
            <p className="font-bold text-[#1B3A6B] text-lg">Thank You!</p>
            <p className="text-gray-400 text-sm">Your feedback has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0C0]" placeholder="Your name (optional)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <p className="text-[#1B3A6B] font-bold text-sm mb-1">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button type="button" key={c}
                  onClick={() => setForm(f => ({ ...f, category: c }))}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${form.category === c ? "bg-[#00A0C0] text-white border-[#00A0C0]" : "border-gray-200 text-gray-600"}`}>
                  {c}
                </button>
              ))}
            </div>
            <textarea className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A0C0] resize-none" rows={5} placeholder="Share your thoughts or suggestions..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
            {status === "error" && <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>}
            <button type="submit" disabled={status === "loading"}
              className="w-full bg-[#00A0C0] text-white rounded-xl py-3 font-bold text-sm active:opacity-80 disabled:opacity-50 mt-1">
              {status === "loading" ? "Submitting..." : "Send Feedback"}
            </button>
          </form>
        )}
      </div>
    </MobilePage>
  );
}
