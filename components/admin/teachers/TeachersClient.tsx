"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

interface ClassItem { id: string; year: number; name: string }
interface TeacherItem {
  id: string; teacherRole: string; subjects: string[];
  user: { fullName: string; email: string };
  classes: ClassItem[];
}

const roleLabels: Record<string, string> = {
  CLASS_TEACHER: "Class Teacher",
  SUBJECT_TEACHER: "Subject Teacher",
  PENOLONG_KANAN: "Penolong Kanan",
  HEADMISTRESS: "Headmistress",
};

const roleBadgeVariant: Record<string, "default" | "secondary" | "accent" | "gold"> = {
  CLASS_TEACHER: "default",
  SUBJECT_TEACHER: "secondary",
  PENOLONG_KANAN: "accent",
  HEADMISTRESS: "gold",
};

function TeacherRoleForm({ teacher, classes, onDone }: { teacher: TeacherItem; classes: ClassItem[]; onDone: () => void }) {
  const router = useRouter();
  const [role, setRole] = useState(teacher.teacherRole);
  const [assignedClassId, setAssignedClassId] = useState(teacher.classes[0]?.id ?? "none");
  const [subjects, setSubjects] = useState(teacher.subjects.join(", "));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch(`/api/admin/teachers/${teacher.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacherRole: role,
        subjects: subjects.split(",").map(s => s.trim()).filter(Boolean),
        assignedClassId: assignedClassId === "none" ? null : assignedClassId,
      }),
    });
    if (res.ok) { router.refresh(); onDone(); }
    else { const d = await res.json(); setError(d.error ?? "Error"); }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(roleLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {role === "CLASS_TEACHER" && (
        <div className="flex flex-col gap-1.5">
          <Label>Assigned Class</Label>
          <Select value={assignedClassId} onValueChange={setAssignedClassId}>
            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— None —</SelectItem>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>Year {c.year}{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label>Subjects (comma separated)</Label>
        <Input value={subjects} onChange={e => setSubjects(e.target.value)} placeholder="e.g. Maths, Science" />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Update"}</Button>
      </div>
    </form>
  );
}

export function TeachersClient({ teachers, classes }: { teachers: TeacherItem[]; classes: ClassItem[] }) {
  const [editItem, setEditItem] = useState<TeacherItem | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Teachers</h1>
      <p className="text-sm text-muted-foreground">Teachers are added when a user with the TEACHER role registers. Assign their role and class here.</p>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned Class</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No teachers yet.</TableCell></TableRow>
            )}
            {teachers.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.user.fullName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.user.email}</TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant[t.teacherRole] ?? "secondary"}>{roleLabels[t.teacherRole] ?? t.teacherRole}</Badge>
                </TableCell>
                <TableCell>{t.classes.map(c => `Year ${c.year}${c.name}`).join(", ") || <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                <TableCell className="text-xs">{t.subjects.join(", ") || "—"}</TableCell>
                <TableCell>
                  <Dialog open={open && editItem?.id === t.id} onOpenChange={o => { setOpen(o); if (o) setEditItem(t); }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost"><Pencil className="h-3.5 w-3.5" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Edit {t.user.fullName}</DialogTitle></DialogHeader>
                      {editItem && <TeacherRoleForm teacher={editItem} classes={classes} onDone={() => setOpen(false)} />}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
