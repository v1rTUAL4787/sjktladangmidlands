import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";
import { linkParentsToStudent } from "@/lib/admin/students";

export async function PUT(req: Request, { params }: { params: { studentId: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { fullName, cardNo, dateOfBirth, gender, classId, parents, removeParentIds } = await req.json();

  const student = await prisma.student.update({
    where: { id: params.studentId },
    data: { fullName, cardNo: cardNo?.trim() || null, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, gender: gender || null, classId },
  });

  // Unlink removed parents
  if (removeParentIds?.length) {
    const profiles = await prisma.parentProfile.findMany({
      where: { user: { id: { in: removeParentIds } } },
      select: { id: true },
    });
    const profileIds = profiles.map(p => p.id);
    await prisma.parentStudent.deleteMany({
      where: { studentId: params.studentId, parentId: { in: profileIds } },
    });
  }

  const invitesSent = parents?.length ? await linkParentsToStudent(params.studentId, parents) : 0;

  return NextResponse.json({ ...student, invitesSent });
}

export async function DELETE(_: Request, { params }: { params: { studentId: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  await prisma.student.delete({ where: { id: params.studentId } });
  return NextResponse.json({ ok: true });
}
