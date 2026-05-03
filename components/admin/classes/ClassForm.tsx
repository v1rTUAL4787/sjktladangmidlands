"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Teacher { id: string; user: { fullName: string } }
interface ClassData { id: string; name: string; year: number; academicYear: string; classTeacherId: string | null }

interface Props {
  teachers: Teacher[];
  existing?: ClassData;
  onDone: () => void;
}

export function ClassForm({ teachers, existing, onDone }: Props) {
  const router = useRouter();
  const [name, setName] = useState(existing?.name ?? "");
  const [year, setYear] = useState(String(existing?.year ?? "1"));
  const [academicYear, setAcademicYear] = useState(existing?.academicYear ?? String(new Date().getFullYear()));
  const [teacherId, setTeacherId] = useState(existing?.classTeacherId ?? "none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = existing ? `/api/admin/classes/${existing.id}` : "/api/admin/classes";
    const method = existing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, year, academicYear, classTeacherId: teacherId === "none" ? null : teacherId }),
    });

    if (res.ok) {
      router.refresh();
      onDone();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Year Level</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5,6].map(y => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Class Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. A" required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Academic Year</Label>
        <Input value={academicYear} onChange={e => setAcademicYear(e.target.value)} placeholder="e.g. 2025" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Class Teacher (optional)</Label>
        <Select value={teacherId} onValueChange={setTeacherId}>
          <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— None —</SelectItem>
            {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.user.fullName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : existing ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
