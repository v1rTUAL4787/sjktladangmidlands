import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { syncTeachers } from "@/lib/sync/teachers";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const academicYear = String(formData.get("academicYear") ?? new Date().getFullYear());
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

  const teacherRows = rows.map(r => ({
    fullName: String(r["fullName"] ?? r["Full Name"] ?? "").trim(),
    email: String(r["email"] ?? r["Email"] ?? "").trim().toLowerCase(),
    teacherRole: String(r["teacherRole"] ?? r["Teacher Role"] ?? "").trim(),
    subjects: String(r["subjects"] ?? r["Subjects"] ?? "").trim(),
    assignedClass: String(r["assignedClass"] ?? r["Assigned Class"] ?? "").trim(),
    academicYear,
  }));

  const result = await syncTeachers(teacherRows, academicYear);
  return NextResponse.json(result);
}
