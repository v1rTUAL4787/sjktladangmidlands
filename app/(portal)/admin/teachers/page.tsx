import { prisma } from "@/lib/prisma/client";
import { TeachersClient } from "@/components/admin/teachers/TeachersClient";

export default async function TeachersPage() {
  const academicYear = String(new Date().getFullYear());

  const [teachers, classes, rosterCount] = await Promise.all([
    prisma.teacherProfile.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        classes: { select: { id: true, year: true, name: true } },
      },
      orderBy: { user: { fullName: "asc" } },
    }),
    prisma.class.findMany({
      orderBy: [{ year: "asc" }, { name: "asc" }],
      select: { id: true, year: true, name: true },
    }),
    prisma.teacherRoster.count(),
  ]);

  return <TeachersClient teachers={teachers} classes={classes} academicYear={academicYear} rosterCount={rosterCount} />;
}
