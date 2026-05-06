"use client";

import { MobilePage } from "@/components/superapp/MobilePage";
import { useState, useEffect } from "react";
import { Send } from "lucide-react";

export default function AppointmentsPage() {
  const [teachers, setTeachers] = useState<{ fullName: string }[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", teacherName: "", preferredDate: "", preferredTime: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    fetch("/api/teachers/list").then(r => r.json()).then(setTeachers).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setStatus(res.ok ? "done" : "error");
  }

  return (
    <MobilePage title="Book Appointment" color="bg-[#F5B800] text-[#1B3A6B]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {status === "done" ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-[#F5B800]/20 flex items-center justify-center mx-auto mb-3">
              <Send className="h-6 w-6 text-[#F5B800]" />
            </div>
            <p className="font-bold text-[#1B3A6B] text-lg">Request Sent!</p>
            <p className="text-gray-400 text-sm mt-1">The school will confirm your appointment shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-[#1B3A6B] font-bold text-base mb-1">Your Details</p>
            <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5B800]" placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <input type="email" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5B800]" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5B800]" placeholder="Phone number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />

            <p className="text-[#1B3A6B] font-bold text-base mt-2 mb-1">Appointment Details</p>
            <select className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5B800] bg-white" value={form.teacherName} onChange={e => setForm(f => ({ ...f, teacherName: e.target.value }))} required>
              <option value="">Select a teacher</option>
              {teachers.map(t => <option key={t.fullName} value={t.fullName}>{t.fullName}</option>)}
            </select>
            <input type="date" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5B800]" value={form.preferredDate} onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))} required min={new Date().toISOString().split("T")[0]} />
            <select className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5B800] bg-white" value={form.preferredTime} onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))} required>
              <option value="">Preferred time</option>
              <option value="07:30 - 08:00">07:30 – 08:00</option>
              <option value="10:00 - 10:30">10:00 – 10:30 (Recess)</option>
              <option value="12:30 - 13:00">12:30 – 13:00 (After school)</option>
              <option value="13:00 - 13:30">13:00 – 13:30</option>
            </select>
            <textarea className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5B800] resize-none" rows={3} placeholder="Reason for appointment (optional)" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
            {status === "error" && <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>}
            <button type="submit" disabled={status === "loading"}
              className="w-full bg-[#F5B800] text-[#1B3A6B] rounded-xl py-3 font-bold text-sm active:opacity-80 disabled:opacity-50 mt-1">
              {status === "loading" ? "Sending..." : "Request Appointment"}
            </button>
          </form>
        )}
      </div>
    </MobilePage>
  );
}
