import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";
import * as XLSX from "xlsx";

// Expected columns: classId, day, period, startTime, endTime, subject, teacherName
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]]);

  let imported = 0; let skipped = 0; const errors: string[] = [];

  for (const row of rows) {
    try {
      const classId = String(row["classId"] ?? "").trim();
      const day = String(row["day"] ?? "").trim();
      const period = parseInt(String(row["period"] ?? "0"));
      const startTime = String(row["startTime"] ?? "").trim();
      const endTime = String(row["endTime"] ?? "").trim();
      const subject = String(row["subject"] ?? "").trim();
      const teacherName = String(row["teacherName"] ?? "").trim();

      if (!classId || !day || !period || !subject) { errors.push(`Skipped: missing fields`); skipped++; continue; }

      await (prisma as any).timetableSlot.upsert({
        where: { classId_day_period: { classId, day, period } },
        update: { startTime, endTime, subject, teacherName },
        create: { classId, day, period, startTime, endTime, subject, teacherName },
      });
      imported++;
    } catch (e) {
      errors.push(`Error: ${(e as Error).message}`);
      skipped++;
    }
  }

  return NextResponse.json({ imported, skipped, errors });
}
