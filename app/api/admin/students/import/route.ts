import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";
import { hashIC, encryptIC } from "@/lib/crypto";
import { linkParentsToStudent, ParentInput } from "@/lib/admin/students";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  let imported = 0;
  let skipped = 0;
  let invitesSent = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const fullName = String(row["fullName"] ?? row["Full Name"] ?? "").trim();
      const icNumber = String(row["icNumber"] ?? row["IC Number"] ?? "").trim().replace(/-/g, "");
      const classId = String(row["classId"] ?? row["Class ID"] ?? "").trim();
      const cardNo = String(row["cardNo"] ?? row["Card No"] ?? row["card_no"] ?? "").trim() || null;
      const gender = String(row["gender"] ?? row["Gender"] ?? "").trim().toUpperCase();
      const rawDob = row["dateOfBirth"] ?? row["Date of Birth"];
      const enrolledYear = parseInt(String(row["enrolledYear"] ?? row["Enrolled Year"] ?? new Date().getFullYear()));

      if (!fullName || !icNumber || !classId) {
        errors.push(`Skipped row: missing fullName/icNumber/classId`);
        skipped++;
        continue;
      }

      const hash = hashIC(icNumber);
      let dob: Date | null = null;
      if (rawDob) {
        if (typeof rawDob === "number") dob = new Date(Math.round((rawDob - 25569) * 86400 * 1000));
        else dob = new Date(String(rawDob));
      }

      const student = await prisma.student.upsert({
        where: { icNumberHash: hash },
        update: { fullName, cardNo, dateOfBirth: dob, gender: (gender === "MALE" || gender === "FEMALE") ? gender as "MALE" | "FEMALE" : null, classId },
        create: {
          fullName,
          icNumberHash: hash,
          icNumberEncrypted: encryptIC(icNumber),
          cardNo,
          dateOfBirth: dob,
          gender: (gender === "MALE" || gender === "FEMALE") ? gender as "MALE" | "FEMALE" : null,
          classId,
          enrolledYear: isNaN(enrolledYear) ? new Date().getFullYear() : enrolledYear,
        },
      });

      // Collect parent columns: parentName, parentEmail, parentRelation, parentWhatsapp
      // and parentName2, parentEmail2, ... for multiple parents
      const parents: ParentInput[] = [];
      for (let n = 1; n <= 5; n++) {
        const suffix = n === 1 ? "" : String(n);
        const pName = String(row[`parentName${suffix}`] ?? row[`Parent Name${suffix === "" ? "" : " " + suffix}`] ?? "").trim();
        const pEmail = String(row[`parentEmail${suffix}`] ?? row[`Parent Email${suffix === "" ? "" : " " + suffix}`] ?? "").trim();
        const pRelation = String(row[`parentRelation${suffix}`] ?? row[`Parent Relation${suffix === "" ? "" : " " + suffix}`] ?? "Parent").trim();
        const pWhatsapp = String(row[`parentWhatsapp${suffix}`] ?? row[`Parent WhatsApp${suffix === "" ? "" : " " + suffix}`] ?? "").trim();
        if (pName && pEmail) parents.push({ name: pName, email: pEmail, relation: pRelation, whatsapp: pWhatsapp || undefined });
      }

      if (parents.length > 0) {
        invitesSent += await linkParentsToStudent(student.id, parents);
      }

      imported++;
    } catch (e) {
      errors.push(`Error on row: ${String(row["fullName"] ?? row["Full Name"] ?? "?")} — ${(e as Error).message}`);
      skipped++;
    }
  }

  return NextResponse.json({ imported, skipped, invitesSent, errors });
}
