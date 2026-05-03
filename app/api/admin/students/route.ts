import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";
import { hashIC, encryptIC } from "@/lib/crypto";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  const students = await prisma.student.findMany({
    where: classId ? { classId } : {},
    include: {
      class: { select: { year: true, name: true } },
      parents: { include: { parent: { include: { user: { select: { fullName: true } } } } } },
    },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { fullName, icNumber, dateOfBirth, gender, classId, enrolledYear } = await req.json();
  if (!fullName || !icNumber || !classId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const hash = hashIC(icNumber);
  const existing = await prisma.student.findUnique({ where: { icNumberHash: hash } });
  if (existing) return NextResponse.json({ error: "Student with this IC already exists" }, { status: 409 });

  const student = await prisma.student.create({
    data: {
      fullName,
      icNumberHash: hash,
      icNumberEncrypted: encryptIC(icNumber),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      classId,
      enrolledYear: enrolledYear ?? new Date().getFullYear(),
    },
  });

  return NextResponse.json(student, { status: 201 });
}
