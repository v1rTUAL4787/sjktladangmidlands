import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const classes = await prisma.class.findMany({
    include: {
      classTeacher: { include: { user: { select: { fullName: true } } } },
      _count: { select: { students: true } },
    },
    orderBy: [{ academicYear: "desc" }, { year: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { name, year, academicYear, classTeacherId } = await req.json();
  if (!name || !year || !academicYear) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    const cls = await prisma.class.create({
      data: { name, year: parseInt(year), academicYear: String(academicYear), classTeacherId: classTeacherId || null },
    });
    return NextResponse.json(cls, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") return NextResponse.json({ error: "Class already exists" }, { status: 409 });
    throw e;
  }
}
