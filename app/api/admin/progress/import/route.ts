import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";
import { hashIC } from "@/lib/crypto";
import * as XLSX from "xlsx";

// Expected columns: icNumber (or studentId), subject, term, academicYear, tpScore, customScore,
//                   requiredAttention, actionPlan, nextMilestone, notes, teacherEmail
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    XLSX.read(buffer, { type: "buffer" }).Sheets[XLSX.read(buffer, { type: "buffer" }).SheetNames[0]]
  );

  let imported = 0; let skipped = 0; const errors: string[] = [];

  for (const row of rows) {
    try {
      const icNumber = String(row["icNumber"] ?? "").trim().replace(/-/g, "");
      const studentId = String(row["studentId"] ?? "").trim();
      const subject = String(row["subject"] ?? "").trim();
      const term = parseInt(String(row["term"] ?? "0"));
      const academicYear = parseInt(String(row["academicYear"] ?? new Date().getFullYear()));
      const tpScore = row["tpScore"] ? parseInt(String(row["tpScore"])) : null;
      const teacherEmail = String(row["teacherEmail"] ?? "").trim();

      if (!subject || !term || !academicYear) { errors.push("Skipped: missing subject/term/year"); skipped++; continue; }

      let resolvedStudentId = studentId;
      if (!resolvedStudentId && icNumber) {
        const student = await prisma.student.findUnique({ where: { icNumberHash: hashIC(icNumber) } });
        if (!student) { errors.push(`Student not found: ${icNumber}`); skipped++; continue; }
        resolvedStudentId = student.id;
      }
      if (!resolvedStudentId) { errors.push("Skipped: no studentId or icNumber"); skipped++; continue; }

      let teacherId: string | null = null;
      if (teacherEmail) {
        const teacher = await prisma.teacherProfile.findFirst({ where: { user: { email: teacherEmail } } });
        teacherId = teacher?.id ?? null;
      }
      if (!teacherId) {
        const anyTeacher = await prisma.teacherProfile.findFirst();
        teacherId = anyTeacher?.id ?? null;
      }
      if (!teacherId) { errors.push("No teacher found in system"); skipped++; continue; }

      await prisma.progressRecord.upsert({
        where: { studentId_subject_term_academicYear: { studentId: resolvedStudentId, subject, term, academicYear } } as never,
        update: {
          tpScore: tpScore && tpScore >= 1 && tpScore <= 6 ? tpScore : null,
          customScore: row["customScore"] ? String(row["customScore"]) : null,
          requiredAttention: row["requiredAttention"] ? String(row["requiredAttention"]) : null,
          actionPlan: row["actionPlan"] ? String(row["actionPlan"]) : null,
          nextMilestone: row["nextMilestone"] ? String(row["nextMilestone"]) : null,
          notes: row["notes"] ? String(row["notes"]) : null,
          teacherId,
        },
        create: {
          studentId: resolvedStudentId,
          subject,
          term,
          academicYear,
          tpScore: tpScore && tpScore >= 1 && tpScore <= 6 ? tpScore : null,
          customScore: row["customScore"] ? String(row["customScore"]) : null,
          requiredAttention: row["requiredAttention"] ? String(row["requiredAttention"]) : null,
          actionPlan: row["actionPlan"] ? String(row["actionPlan"]) : null,
          nextMilestone: row["nextMilestone"] ? String(row["nextMilestone"]) : null,
          notes: row["notes"] ? String(row["notes"]) : null,
          teacherId,
        },
      });
      imported++;
    } catch (e) {
      errors.push(`Error: ${(e as Error).message}`);
      skipped++;
    }
  }

  return NextResponse.json({ imported, skipped, errors });
}
