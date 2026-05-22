import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";
import { hashIC, encryptIC } from "@/lib/crypto";
import { linkParentsToStudent } from "@/lib/admin/students";

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

  const { fullName, icNumber, cardNo, dateOfBirth, gender, classId, enrolledYear, parents } = await req.json();
  if (!fullName || !icNumber || !classId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const hash = hashIC(icNumber);
  const existing = await prisma.student.findUnique({ where: { icNumberHash: hash } });
  if (existing) return NextResponse.json({ error: "Student with this IC already exists" }, { status: 409 });

  const student = await prisma.student.create({
    data: {
      fullName,
      icNumberHash: hash,
      icNumberEncrypted: encryptIC(icNumber),
      cardNo: cardNo?.trim() || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      classId,
      enrolledYear: enrolledYear ?? new Date().getFullYear(),
    },
  });

  const invitesSent = parents?.length ? await linkParentsToStudent(student.id, parents) : 0;

  return NextResponse.json({ ...student, invitesSent }, { status: 201 });
}
