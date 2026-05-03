"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, RefreshCw } from "lucide-react";

interface SyncResult { upserted: number; skipped: number; errors: string[] }

export function TeacherImportForm({ academicYear, onDone }: { academicYear: string; onDone: () => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("academicYear", academicYear);
    const res = await fetch("/api/admin/teachers/import", { method: "POST", body: fd });
    setResult(await res.json());
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Upload an Excel file with columns: <code className="bg-muted px-1 rounded text-xs">fullName, email, teacherRole, subjects, assignedClass</code>
      </p>
      <p className="text-xs text-muted-foreground">
        Valid roles: <code className="bg-muted px-1 rounded text-xs">CLASS_TEACHER, SUBJECT_TEACHER, PENOLONG_KANAN, HEADMISTRESS</code><br />
        Assigned class format: <code className="bg-muted px-1 rounded text-xs">3A</code> or <code className="bg-muted px-1 rounded text-xs">Year 3A</code>
      </p>
      <div className="flex flex-col gap-1.5">
        <Label>Academic Year</Label>
        <Input value={academicYear} readOnly className="bg-muted" />
      </div>
      <Input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      {result && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <p className="font-medium">✓ {result.upserted} synced, {result.skipped} skipped</p>
          {result.errors.slice(0, 5).map((err, i) => <p key={i} className="text-amber-600 text-xs mt-1">{err}</p>)}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onDone}>Close</Button>
        <Button onClick={handleImport} disabled={!file || loading}>
          <Upload className="h-4 w-4 mr-1" />{loading ? "Importing..." : "Import"}
        </Button>
      </div>
    </div>
  );
}

export function TeacherSyncForm({ academicYear, onDone }: { academicYear: string; onDone: () => void }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  async function handleSync() {
    if (!url) return;
    setLoading(true);
    const res = await fetch("/api/admin/teachers/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheetsUrl: url, academicYear }),
    });
    setResult(await res.json());
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Paste the Google Sheets share URL. The sheet must be set to <strong>Anyone with the link can view</strong>.
      </p>
      <p className="text-xs text-muted-foreground">
        Required columns: <code className="bg-muted px-1 rounded text-xs">fullName, email, teacherRole, subjects, assignedClass</code>
      </p>
      <div className="flex flex-col gap-1.5">
        <Label>Google Sheets URL</Label>
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/..." />
      </div>
      {result && (
        <div className="rounded-md bg-muted p-3 text-sm">
          {"error" in result
            ? <p className="text-red-500">{(result as unknown as { error: string }).error}</p>
            : <p className="font-medium">✓ {result.upserted} synced, {result.skipped} skipped</p>}
          {result.errors?.slice(0, 5).map((err, i) => <p key={i} className="text-amber-600 text-xs mt-1">{err}</p>)}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onDone}>Close</Button>
        <Button onClick={handleSync} disabled={!url || loading}>
          <RefreshCw className="h-4 w-4 mr-1" />{loading ? "Syncing..." : "Sync Now"}
        </Button>
      </div>
    </div>
  );
}
