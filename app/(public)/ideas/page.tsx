"use client";

import { MobilePage } from "@/components/superapp/MobilePage";
import { useState } from "react";
import { Lightbulb } from "lucide-react";

export default function IdeasPage() {
  const [form, setForm] = useState({ name: "", email: "", title: "", idea: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setStatus(res.ok ? "done" : "error");
  }

  return (
    <MobilePage title="Share an Idea" color="bg-amber-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {status === "done" ? (
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
              <Lightbulb className="h-7 w-7 text-amber-500" />
            </div>
            <p className="font-bold text-[#1B3A6B] text-lg">Idea Submitted!</p>
            <p className="text-gray-400 text-sm">Thank you — your idea helps make our school better.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-gray-400 text-sm mb-2">Share ideas to improve our school — facilities, events, programmes, anything.</p>
            <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Your name (optional)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input type="email" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Email (optional)" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Idea title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <textarea className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" rows={5} placeholder="Describe your idea..." value={form.idea} onChange={e => setForm(f => ({ ...f, idea: e.target.value }))} required />
            {status === "error" && <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>}
            <button type="submit" disabled={status === "loading"}
              className="w-full bg-amber-500 text-white rounded-xl py-3 font-bold text-sm active:opacity-80 disabled:opacity-50 mt-1">
              {status === "loading" ? "Submitting..." : "Submit Idea"}
            </button>
          </form>
        )}
      </div>
    </MobilePage>
  );
}
