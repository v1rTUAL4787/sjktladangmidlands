"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface Student { id: string; fullName: string; }

interface Props {
  slotId: string;
  teacherId: string;
  parentId: string;
  students: Student[];
}

export function BookAppointmentForm({ slotId, teacherId, parentId, students }: Props) {
  const t = useTranslations("appointments");
  const router = useRouter();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, teacherId, parentId, studentId, notes }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to book");
      setLoading(false);
    } else {
      router.push("/appointments");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium">{t("select_child")}</label>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.fullName}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notes_placeholder")}
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
      </div>

      {error && <p className="text-sm text-crimson">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Booking..." : t("submit")}
      </Button>
    </form>
  );
}
