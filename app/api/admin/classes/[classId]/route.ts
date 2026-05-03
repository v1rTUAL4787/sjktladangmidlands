import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";

export async function PUT(req: Request, { params }: { params: { classId: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { name, year, academicYear, classTeacherId } = await req.json();
  const cls = await prisma.class.update({
    where: { id: params.classId },
    data: { name, year: parseInt(year), academicYear: String(academicYear), classTeacherId: classTeacherId || null },
  });
  return NextResponse.json(cls);
}

export async function DELETE(_: Request, { params }: { params: { classId: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const cls = await prisma.class.findUnique({ where: { id: params.classId }, include: { _count: { select: { students: true } } } });
  if (!cls) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (cls._count.students > 0) return NextResponse.json({ error: "Cannot delete class with enrolled students" }, { status: 409 });

  await prisma.class.delete({ where: { id: params.classId } });
  return NextResponse.json({ ok: true });
}
