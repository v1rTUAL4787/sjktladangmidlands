import { prisma } from "@/lib/prisma/client";
import { AttendanceClient } from "@/components/admin/attendance/AttendanceClient";
import { startOfDay, endOfDay } from "date-fns";

export default async function AttendancePage() {
  const today = new Date();

  const [records, classes] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: {
        date: { gte: startOfDay(today), lte: endOfDay(today) },
      },
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
      orderBy: [{ student: { fullName: "asc" } }],
    }),
    prisma.class.findMany({
      orderBy: [{ year: "asc" }, { name: "asc" }],
      select: { id: true, year: true, name: true },
    }),
  ]);

  const serialized = records.map((r) => ({
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

  return (
    <AttendanceClient
      initialRecords={serialized}
      classes={classes}
      initialDate={today.toISOString().split("T")[0]}
    />
  );
}
