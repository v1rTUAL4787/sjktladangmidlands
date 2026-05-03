"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SLOT_TYPES = ["CONSULTATION", "CLASS", "SCHOOL_DUTY", "BLOCKED"] as const;

export function AddSlotForm({ teacherId }: { teacherId: string }) {
  const t = useTranslations("appointments");
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotType, setSlotType] = useState<typeof SLOT_TYPES[number]>("CONSULTATION");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/teacher/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, date, startTime, endTime, slotType, label }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create slot");
      setLoading(false);
    } else {
      router.push("/teacher/schedule");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1" min={new Date().toISOString().split("T")[0]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Start Time</label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">End Time</label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="mt-1" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Slot Type</label>
        <select
          value={slotType}
          onChange={(e) => setSlotType(e.target.value as typeof SLOT_TYPES[number])}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {SLOT_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`slot_type_${type.toLowerCase()}` as any)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Label (optional)</label>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Exam invigilation" className="mt-1" />
      </div>
      {error && <p className="text-sm text-crimson">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Slot"}
      </Button>
    </form>
  );
}
