import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";

export async function PUT(req: Request, { params }: { params: { teacherId: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { teacherRole, subjects, assignedClassId } = await req.json();

  await prisma.teacherProfile.update({
    where: { id: params.teacherId },
    data: { teacherRole, subjects: subjects ?? [] },
  });

  if (assignedClassId) {
    await prisma.class.update({ where: { id: assignedClassId }, data: { classTeacherId: params.teacherId } });
  }

  return NextResponse.json({ ok: true });
}
