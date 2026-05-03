"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";

interface ClassItem { id: string; year: number; name: string }
interface StudentItem {
  id: string; fullName: string; gender: string | null; dateOfBirth: string | null; enrolledYear: number;
  class: { year: number; name: string };
  parents: { parent: { user: { fullName: string } } }[];
}

function StudentForm({ classes, existing, onDone }: {
  classes: ClassItem[];
  existing?: StudentItem;
  onDone: () => void;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(existing?.fullName ?? "");
  const [icNumber, setIcNumber] = useState("");
  const [dob, setDob] = useState(existing?.dateOfBirth ? existing.dateOfBirth.slice(0, 10) : "");
  const [gender, setGender] = useState(existing?.gender ?? "none");
  const [classId, setClassId] = useState(existing?.class ? classes.find(c => c.year === existing.class.year && c.name === existing.class.name)?.id ?? "none" : "none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!existing && !icNumber) { setError("IC Number is required"); return; }
    setLoading(true); setError("");
    const url = existing ? `/api/admin/students/${existing.id}` : "/api/admin/students";
    const method = existing ? "PUT" : "POST";
    const body: Record<string, unknown> = { fullName, dateOfBirth: dob || null, gender: gender === "none" ? null : gender, classId };
    if (!existing) body.icNumber = icNumber;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { router.refresh(); onDone(); }
    else { const d = await res.json(); setError(d.error ?? "Error"); }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Full Name</Label>
        <Input value={fullName} onChange={e => setFullName(e.target.value)} required />
      </div>
      {!existing && (
        <div className="flex flex-col gap-1.5">
          <Label>IC Number (MyKid/MyKad)</Label>
          <Input value={icNumber} onChange={e => setIcNumber(e.target.value.replace(/-/g, ""))} placeholder="e.g. 123456789012" required />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Date of Birth</Label>
          <Input type="date" value={dob} onChange={e => setDob(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Select —</SelectItem>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Class</Label>
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
          <SelectContent>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>Year {c.year}{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : existing ? "Update" : "Add Student"}</Button>
      </div>
    </form>
  );
}

function BulkImportForm({ classes, onDone }: { classes: ClassItem[]; onDone: () => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/students/import", { method: "POST", body: fd });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Upload an Excel file with columns: <code className="bg-muted px-1 rounded text-xs">fullName, icNumber, dateOfBirth, gender (MALE/FEMALE), classId, enrolledYear</code>
      </p>
      <p className="text-xs text-muted-foreground">Class IDs:</p>
      <div className="text-xs bg-muted rounded p-2 max-h-24 overflow-y-auto">
        {classes.map(c => <div key={c.id}>{c.id} → Year {c.year}{c.name}</div>)}
      </div>
      <Input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      {result && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <p className="font-medium">✓ {result.imported} imported, {result.skipped} skipped</p>
          {result.errors.slice(0, 3).map((err, i) => <p key={i} className="text-red-500 text-xs mt-1">{err}</p>)}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>Close</Button>
        <Button onClick={handleImport} disabled={!file || loading}>{loading ? "Importing..." : "Import"}</Button>
      </div>
    </div>
  );
}

export function StudentsClient({ students, classes }: { students: StudentItem[]; classes: ClassItem[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editItem, setEditItem] = useState<StudentItem | null>(null);
  const [filterClass, setFilterClass] = useState("all");

  const filtered = filterClass === "all" ? students : students.filter(s => `${s.class.year}${s.class.name}` === filterClass);

  async function handleDelete(id: string) {
    if (!confirm("Delete this student? This cannot be undone.")) return;
    await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-2xl font-bold text-primary">Students</h1>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(c => <SelectItem key={c.id} value={`${c.year}${c.name}`}>Year {c.year}{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild><Button variant="outline"><Upload className="h-4 w-4 mr-1" /> Import Excel</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Bulk Import Students</DialogTitle></DialogHeader>
              <BulkImportForm classes={classes} onDone={() => setImportOpen(false)} />
            </DialogContent>
          </Dialog>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button onClick={() => setEditItem(null)}><Plus className="h-4 w-4 mr-1" /> Add Student</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editItem ? "Edit Student" : "Add Student"}</DialogTitle></DialogHeader>
              <StudentForm classes={classes} existing={editItem ?? undefined} onDone={() => setAddOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</p>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Parents</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No students found.</TableCell></TableRow>
            )}
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.fullName}</TableCell>
                <TableCell>Year {s.class.year}{s.class.name}</TableCell>
                <TableCell>{s.gender ? <Badge variant="secondary">{s.gender}</Badge> : "—"}</TableCell>
                <TableCell>{s.dateOfBirth ? format(new Date(s.dateOfBirth), "dd MMM yyyy") : "—"}</TableCell>
                <TableCell className="text-xs">{s.parents.map(p => p.parent.user.fullName).join(", ") || <span className="text-muted-foreground">None</span>}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditItem(s); setAddOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
