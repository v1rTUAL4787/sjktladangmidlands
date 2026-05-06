import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const teachers = await prisma.teacherProfile.findMany({
    include: { user: { select: { fullName: true } } },
    orderBy: { user: { fullName: "asc" } },
  });
  return NextResponse.json(teachers.map(t => ({ fullName: t.user.fullName })));
}
