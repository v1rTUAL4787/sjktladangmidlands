import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";

export async function PUT(req: Request, { params }: { params: { studentId: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { fullName, dateOfBirth, gender, classId } = await req.json();
  const student = await prisma.student.update({
    where: { id: params.studentId },
    data: { fullName, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, gender: gender || null, classId },
  });
  return NextResponse.json(student);
}

export async function DELETE(_: Request, { params }: { params: { studentId: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  await prisma.student.delete({ where: { id: params.studentId } });
  return NextResponse.json({ ok: true });
}
