import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const studentName = searchParams.get("studentName");
  const classId = searchParams.get("classId");
  const cardNo = searchParams.get("cardNo");

  // Build date filter
  let dateFilter: { gte: Date; lte: Date };
  if (date) {
    const d = new Date(date);
    dateFilter = { gte: startOfDay(d), lte: endOfDay(d) };
  } else {
    const today = new Date();
    dateFilter = { gte: startOfDay(subDays(today, 6)), lte: endOfDay(today) };
  }

  // Build where clause
  const where: Record<string, unknown> = {
    date: dateFilter,
  };

  if (studentName) {
    where.student = {
      ...(where.student as object),
      fullName: { contains: studentName, mode: "insensitive" },
    };
  }

  if (classId) {
    where.student = {
      ...(where.student as object),
      classId,
    };
  }

  if (cardNo) {
    where.student = {
      ...(where.student as object),
      cardNo: { contains: cardNo, mode: "insensitive" },
    };
  }

  const records = await prisma.attendanceRecord.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          cardNo: true,
          class: { select: { year: true, name: true } },
        },
      },
    },
    orderBy: [{ date: "desc" }, { student: { fullName: "asc" } }],
    take: 500,
  });

  const result = records.map((r) => ({
    id: r.id,
    date: r.date.toISOString(),
    present: r.present,
    reason: r.reason,
    studentId: r.studentId,
    studentName: r.student.fullName,
    cardNo: r.student.cardNo,
    classYear: r.student.class.year,
    className: r.student.class.name,
  }));

  return NextResponse.json(result);
}
