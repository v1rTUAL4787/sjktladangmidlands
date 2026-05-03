import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const teachers = await prisma.teacherProfile.findMany({
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      classes: { select: { id: true, year: true, name: true, academicYear: true } },
    },
    orderBy: { user: { fullName: "asc" } },
  });

  return NextResponse.json(teachers);
}
