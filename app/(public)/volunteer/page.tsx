"use client";

import { MobilePage } from "@/components/superapp/MobilePage";
import { useState } from "react";
import { Users } from "lucide-react";

const SKILL_OPTIONS = ["Teaching / Tutoring", "IT / Technology", "Art & Craft", "Sports Coaching", "Event Management", "Gardening", "Carpentry / Maintenance", "Cooking / Canteen", "Administration", "Other"];
const AVAIL_OPTIONS = ["Weekday mornings", "Weekday afternoons", "Saturdays", "Sundays", "School holidays only", "Flexible"];

export default function VolunteerPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", skills: [] as string[], availability: [] as string[], message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  function toggle(key: "skills" | "availability", val: string) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/volunteer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, skills: form.skills.join(", "), availability: form.availability.join(", ") }),
    });
    setStatus(res.ok ? "done" : "error");
  }

  return (
    <MobilePage title="Volunteer" color="bg-emerald-600">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {status === "done" ? (
          <div className="flex flex-col items-center text-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Users className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="font-bold text-[#1B3A6B] text-lg">Thank You!</p>
            <p className="text-gray-400 text-sm">We'll be in touch to discuss how you can contribute.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-[#1B3A6B] font-bold text-base mb-1">Your Details</p>
            <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <input type="email" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Phone number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />

            <p className="text-[#1B3A6B] font-bold text-base mt-2 mb-1">Skills & Expertise</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(s => (
                <button type="button" key={s}
                  onClick={() => toggle("skills", s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${form.skills.includes(s) ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 text-gray-600"}`}>
                  {s}
                </button>
              ))}
            </div>

            <p className="text-[#1B3A6B] font-bold text-base mt-2 mb-1">Availability</p>
            <div className="flex flex-wrap gap-2">
              {AVAIL_OPTIONS.map(a => (
                <button type="button" key={a}
                  onClick={() => toggle("availability", a)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${form.availability.includes(a) ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 text-gray-600"}`}>
                  {a}
                </button>
              ))}
            </div>

            <textarea className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mt-1" rows={3} placeholder="Anything else you'd like to share..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
            {status === "error" && <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>}
            <button type="submit" disabled={status === "loading"}
              className="w-full bg-emerald-600 text-white rounded-xl py-3 font-bold text-sm active:opacity-80 disabled:opacity-50 mt-1">
              {status === "loading" ? "Submitting..." : "Sign Up to Volunteer"}
            </button>
          </form>
        )}
      </div>
    </MobilePage>
  );
}
