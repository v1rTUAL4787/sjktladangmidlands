"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClassForm } from "./ClassForm";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Teacher { id: string; user: { fullName: string } }
interface ClassItem {
  id: string; name: string; year: number; academicYear: string; classTeacherId: string | null;
  classTeacher: { user: { fullName: string } } | null;
  _count: { students: number };
}

export function ClassesClient({ classes, teachers }: { classes: ClassItem[]; teachers: Teacher[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<ClassItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
    if (res.ok) { setDeleteId(null); router.refresh(); }
    else { const d = await res.json(); setDeleteError(d.error); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Classes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditItem(null)}><Plus className="h-4 w-4 mr-1" /> Add Class</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? "Edit Class" : "New Class"}</DialogTitle></DialogHeader>
            <ClassForm teachers={teachers} existing={editItem ?? undefined} onDone={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Class Teacher</TableHead>
              <TableHead>Students</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No classes yet. Add one above.</TableCell></TableRow>
            )}
            {classes.map(cls => (
              <TableRow key={cls.id}>
                <TableCell className="font-medium">Year {cls.year}{cls.name}</TableCell>
                <TableCell>{cls.academicYear}</TableCell>
                <TableCell>{cls.classTeacher?.user.fullName ?? <span className="text-muted-foreground text-xs">Unassigned</span>}</TableCell>
                <TableCell><Badge variant="secondary">{cls._count.students}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditItem(cls); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Dialog open={deleteId === cls.id} onOpenChange={o => { setDeleteId(o ? cls.id : null); setDeleteError(""); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Delete Year {cls.year}{cls.name}?</DialogTitle></DialogHeader>
                        <p className="text-sm text-muted-foreground">This cannot be undone.</p>
                        {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                          <Button variant="destructive" onClick={() => handleDelete(cls.id)}>Delete</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
