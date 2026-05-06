"use client";

import { MobilePage } from "@/components/superapp/MobilePage";
import { useState, useEffect } from "react";
import { QrCode } from "lucide-react";
import Image from "next/image";

export default function VisitorPage() {
  const [teachers, setTeachers] = useState<{ fullName: string }[]>([]);
  const [form, setForm] = useState({ parentName: "", studentName: "", carPlate: "", visitDate: "", visitTime: "", reason: "", teacherName: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [qrUrl, setQrUrl] = useState("");
  const [regId, setRegId] = useState("");

  useEffect(() => {
    fetch("/api/teachers/list").then(r => r.json()).then(setTeachers).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/visitor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) {
      const data = await res.json();
      setQrUrl(data.qrUrl);
      setRegId(data.id);
      setStatus("done");
    } else {
      setStatus("error");
    }
  }

  return (
    <MobilePage title="Visitor Entry" color="bg-[#1B3A6B]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {status === "done" ? (
          <div className="flex flex-col items-center text-center py-4 gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1B3A6B]/10 flex items-center justify-center">
              <QrCode className="h-7 w-7 text-[#1B3A6B]" />
            </div>
            <div>
              <p className="font-bold text-[#1B3A6B] text-lg">Registration Complete</p>
              <p className="text-gray-400 text-sm mt-1">Show this QR code to the guard on arrival and departure.</p>
            </div>
            {qrUrl && (
              <div className="rounded-2xl border-2 border-[#1B3A6B] p-3 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="Visitor QR Code" className="w-52 h-52" />
              </div>
            )}
            <p className="text-xs text-gray-400">Ref: {regId.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs text-gray-400 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              Screenshot this QR code to use at the school gate.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-[#1B3A6B] font-bold text-base mb-1">Visitor Details</p>
            <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="Parent / Guardian name" value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} required />
            <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="Student name" value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} required />
            <input className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] uppercase" placeholder="Car plate number (e.g. WHV1234)" value={form.carPlate} onChange={e => setForm(f => ({ ...f, carPlate: e.target.value.toUpperCase() }))} required />

            <p className="text-[#1B3A6B] font-bold text-base mt-2 mb-1">Visit Details</p>
            <input type="date" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" value={form.visitDate} onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))} required min={new Date().toISOString().split("T")[0]} />
            <select className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white" value={form.visitTime} onChange={e => setForm(f => ({ ...f, visitTime: e.target.value }))} required>
              <option value="">Visiting time</option>
              <option value="07:00 - 08:00">07:00 – 08:00 (Before school)</option>
              <option value="10:00 - 10:30">10:00 – 10:30 (Recess)</option>
              <option value="12:30 - 13:30">12:30 – 13:30 (After school)</option>
              <option value="Other">Other (specify in reason)</option>
            </select>
            <select className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white" value={form.teacherName} onChange={e => setForm(f => ({ ...f, teacherName: e.target.value }))} required>
              <option value="">Visiting which teacher?</option>
              <option value="School Office">School Office</option>
              {teachers.map(t => <option key={t.fullName} value={t.fullName}>{t.fullName}</option>)}
            </select>
            <textarea className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] resize-none" rows={3} placeholder="Reason for visit" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required />
            {status === "error" && <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>}
            <button type="submit" disabled={status === "loading"}
              className="w-full bg-[#1B3A6B] text-white rounded-xl py-3 font-bold text-sm active:opacity-80 disabled:opacity-50 mt-1">
              {status === "loading" ? "Generating QR..." : "Register & Get QR Code"}
            </button>
          </form>
        )}
      </div>
    </MobilePage>
  );
}
