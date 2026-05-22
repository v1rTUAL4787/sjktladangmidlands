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
import { Plus, Pencil, Trash2, Upload, X, ChevronUp } from "lucide-react";
import { format } from "date-fns";

interface ClassItem { id: string; year: number; name: string }
interface LinkedParent {
  parentId: string;
  relation: string;
  parent: { id: string; whatsappNumber: string; user: { fullName: string; email: string; phone: string | null } };
}
interface StudentItem {
  id: string; fullName: string; cardNo: string | null; gender: string | null; dateOfBirth: string | null; enrolledYear: number;
  class: { year: number; name: string };
  parents: LinkedParent[];
}

interface ParentInput { name: string; email: string; whatsapp: string; relation: string }
interface ParentEdit { fullName: string; relation: string; whatsapp: string }

function ParentSection({
  existing,
  linkedParents,
  onRemoveParent,
  editedParents,
  onEditParent,
  newParents,
  onAddParent,
  onRemoveNew,
}: {
  existing: boolean;
  linkedParents: LinkedParent[];
  onRemoveParent: (parentId: string) => void;
  editedParents: Map<string, ParentEdit>;
  onEditParent: (parentId: string, edit: ParentEdit) => void;
  newParents: ParentInput[];
  onAddParent: (p: ParentInput) => void;
  onRemoveNew: (index: number) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [relation, setRelation] = useState("Mother");
  const [expandedParentId, setExpandedParentId] = useState<string | null>(null);

  function addParent() {
    if (!name || !email) return;
    onAddParent({ name, email, whatsapp, relation });
    setName(""); setEmail(""); setWhatsapp(""); setRelation("Mother");
  }

  return (
    <div className="border-t pt-4 flex flex-col gap-3">
      <p className="text-sm font-semibold text-primary">Parent / Guardian Details</p>

      {existing && linkedParents.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground font-medium">Linked parents</p>
          {linkedParents.map(lp => {
            const edit = editedParents.get(lp.parent.id) ?? {
              fullName: lp.parent.user.fullName,
              relation: lp.relation,
              whatsapp: lp.parent.whatsappNumber || lp.parent.user.phone || "",
            };
            const isExpanded = expandedParentId === lp.parent.id;
            const isDirty = editedParents.has(lp.parent.id);

            return (
              <div key={lp.parent.id} className={`rounded-md border text-sm ${isDirty ? "border-blue-300 bg-blue-50/30" : ""}`}>
                {/* Parent row header */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <span className="font-medium">{edit.fullName}</span>
                    <span className="text-muted-foreground ml-2">({edit.relation})</span>
                    {isDirty && <span className="ml-2 text-[10px] text-blue-500 font-medium">edited</span>}
                    <div className="text-xs text-muted-foreground">{lp.parent.user.email}</div>
                  </div>
                  <div className="flex gap-0.5">
                    <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0"
                      onClick={() => setExpandedParentId(isExpanded ? null : lp.parent.id)}>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="text-red-500 hover:text-red-600 h-7 w-7 p-0"
                      onClick={() => onRemoveParent(lp.parent.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Inline edit fields — no save button, changes held in state until Update */}
                {isExpanded && (
                  <div className="px-3 pb-3 flex flex-col gap-2.5 border-t">
                    <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Full Name</Label>
                        <Input value={edit.fullName} className="h-8 text-sm"
                          onChange={e => onEditParent(lp.parent.id, { ...edit, fullName: e.target.value })} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Relation</Label>
                        <Select value={edit.relation} onValueChange={v => onEditParent(lp.parent.id, { ...edit, relation: v })}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mother">Mother</SelectItem>
                            <SelectItem value="Father">Father</SelectItem>
                            <SelectItem value="Guardian">Guardian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Email <span className="text-muted-foreground">(cannot be changed — Google login)</span></Label>
                      <Input value={lp.parent.user.email} disabled className="h-8 text-sm bg-muted" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">WhatsApp</Label>
                      <Input value={edit.whatsapp} placeholder="+601X-XXXXXXX" className="h-8 text-sm"
                        onChange={e => onEditParent(lp.parent.id, { ...edit, whatsapp: e.target.value })} />
                    </div>
                    <p className="text-[11px] text-blue-500">Changes will be saved when you click Update below.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {newParents.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground font-medium">To be added</p>
          {newParents.map((p, i) => (
            <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm bg-green-50">
              <div>
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground ml-2">({p.relation})</span>
                <div className="text-xs text-muted-foreground">{p.email}</div>
              </div>
              <Button type="button" size="sm" variant="ghost" className="text-red-500 hover:text-red-600 h-7 w-7 p-0"
                onClick={() => onRemoveNew(i)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-md border p-3 flex flex-col gap-3 bg-muted/30">
        <p className="text-xs text-muted-foreground font-medium">Add a parent</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="h-8 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Relation</Label>
            <Select value={relation} onValueChange={setRelation}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Mother">Mother</SelectItem>
                <SelectItem value="Father">Father</SelectItem>
                <SelectItem value="Guardian">Guardian</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Email <span className="text-muted-foreground">(parent uses this to sign in with Google)</span></Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="parent@example.com" className="h-8 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">WhatsApp <span className="text-muted-foreground">(optional)</span></Label>
          <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+601X-XXXXXXX" className="h-8 text-sm" />
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addParent} disabled={!name || !email}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Parent
        </Button>
      </div>
    </div>
  );
}

function StudentForm({ classes, existing, onDone }: {
  classes: ClassItem[];
  existing?: StudentItem;
  onDone: () => void;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(existing?.fullName ?? "");
  const [icNumber, setIcNumber] = useState("");
  const [cardNo, setCardNo] = useState(existing?.cardNo ?? "");
  const [dob, setDob] = useState(existing?.dateOfBirth ? existing.dateOfBirth.slice(0, 10) : "");
  const [gender, setGender] = useState(existing?.gender ?? "none");
  const [classId, setClassId] = useState(
    existing?.class ? classes.find(c => c.year === existing.class.year && c.name === existing.class.name)?.id ?? "none" : "none"
  );

  const [linkedParents, setLinkedParents] = useState<LinkedParent[]>(existing?.parents ?? []);
  const [removedParentIds, setRemovedParentIds] = useState<string[]>([]);
  const [newParents, setNewParents] = useState<ParentInput[]>([]);
  const [editedParents, setEditedParents] = useState<Map<string, ParentEdit>>(new Map());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleRemoveLinked(parentId: string) {
    setLinkedParents(prev => prev.filter(lp => lp.parent.id !== parentId));
    setRemovedParentIds(prev => [...prev, parentId]);
    setEditedParents(prev => { const m = new Map(prev); m.delete(parentId); return m; });
  }

  function handleEditParent(parentId: string, edit: ParentEdit) {
    setEditedParents(prev => new Map(prev).set(parentId, edit));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!existing && !icNumber) { setError("IC Number is required"); return; }
    setLoading(true); setError(""); setSuccess("");

    // Save parent edits first (parallel)
    if (editedParents.size > 0 && existing) {
      await Promise.all(Array.from(editedParents.entries()).map(([parentId, edit]) =>
        fetch(`/api/admin/parents/${parentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: edit.fullName, relation: edit.relation, whatsapp: edit.whatsapp, studentId: existing.id }),
        })
      ));
    }

    const url = existing ? `/api/admin/students/${existing.id}` : "/api/admin/students";
    const method = existing ? "PUT" : "POST";

    const body: Record<string, unknown> = {
      fullName,
      cardNo: cardNo || null,
      dateOfBirth: dob || null,
      gender: gender === "none" ? null : gender,
      classId,
    };

    if (!existing) {
      body.icNumber = icNumber;
      if (newParents.length > 0) body.parents = newParents;
    } else {
      body.removeParentIds = removedParentIds;
      if (newParents.length > 0) body.parents = newParents;
    }

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();

    if (res.ok) {
      router.refresh();
      const createdCount = data.invitesSent ?? 0;
      if (createdCount > 0) {
        setSuccess(`Saved. ${createdCount} parent account${createdCount > 1 ? "s" : ""} created. They can now sign in with Google.`);
        setTimeout(() => onDone(), 2000);
      } else {
        onDone();
      }
    } else {
      setError(data.error ?? "Error");
    }
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
      <div className="flex flex-col gap-1.5">
        <Label>Card No <span className="text-muted-foreground text-xs">(attendance device ID, e.g. STU001)</span></Label>
        <Input value={cardNo} onChange={e => setCardNo(e.target.value.trim())} placeholder="e.g. STU001" />
      </div>
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

      <ParentSection
        existing={!!existing}
        linkedParents={linkedParents}
        onRemoveParent={handleRemoveLinked}
        editedParents={editedParents}
        onEditParent={handleEditParent}
        newParents={newParents}
        onAddParent={p => setNewParents(prev => [...prev, p])}
        onRemoveNew={i => setNewParents(prev => prev.filter((_, idx) => idx !== i))}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
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
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[]; invitesSent?: number } | null>(null);

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
      <p className="text-sm text-muted-foreground">Upload an Excel file with columns:</p>
      <div className="text-xs bg-muted rounded p-2 space-y-1">
        <p className="font-medium">Required: <code>fullName, icNumber, classId</code></p>
        <p className="text-muted-foreground">Optional student: <code>cardNo, dateOfBirth, gender (MALE/FEMALE), enrolledYear</code></p>
        <p className="text-muted-foreground">Optional parent: <code>parentName, parentEmail, parentRelation, parentWhatsapp</code></p>
        <p className="text-muted-foreground italic">Multiple parents: add columns parentName2, parentEmail2, parentRelation2, parentWhatsapp2 etc.</p>
      </div>
      <p className="text-xs text-muted-foreground">Class IDs:</p>
      <div className="text-xs bg-muted rounded p-2 max-h-24 overflow-y-auto">
        {classes.map(c => <div key={c.id}>{c.id} → Year {c.year}{c.name}</div>)}
      </div>
      <Input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      {result && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <p className="font-medium">✓ {result.imported} imported, {result.skipped} skipped{result.invitesSent ? `, ${result.invitesSent} parent account${result.invitesSent > 1 ? "s" : ""} created` : ""}</p>
          {result.errors.slice(0, 5).map((err, i) => <p key={i} className="text-red-500 text-xs mt-1">{err}</p>)}
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
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
              <TableHead>Card No</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Parents</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No students found.</TableCell></TableRow>
            )}
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.fullName}</TableCell>
                <TableCell>Year {s.class.year}{s.class.name}</TableCell>
                <TableCell><code className="text-xs">{s.cardNo ?? "—"}</code></TableCell>
                <TableCell>{s.gender ? <Badge variant="secondary">{s.gender}</Badge> : "—"}</TableCell>
                <TableCell>{s.dateOfBirth ? format(new Date(s.dateOfBirth), "dd MMM yyyy") : "—"}</TableCell>
                <TableCell className="text-xs">
                  {s.parents.length > 0
                    ? s.parents.map(p => p.parent.user.fullName).join(", ")
                    : <span className="text-muted-foreground">None</span>}
                </TableCell>
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
