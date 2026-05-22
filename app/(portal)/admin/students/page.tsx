import { prisma } from "@/lib/prisma/client";
import { StudentsClient } from "@/components/admin/students/StudentsClient";

export default async function StudentsPage() {
  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      include: {
        class: { select: { year: true, name: true } },
        parents: {
          include: {
            parent: {
              select: {
                id: true,
                whatsappNumber: true,
                user: { select: { fullName: true, email: true, phone: true } },
              },
            },
          },
        },
      },
      orderBy: [{ class: { year: "asc" } }, { fullName: "asc" }],
    }),
    prisma.class.findMany({
      orderBy: [{ year: "asc" }, { name: "asc" }],
      select: { id: true, year: true, name: true },
    }),
  ]);

  const serialized = students.map(s => ({
    ...s,
    dateOfBirth: s.dateOfBirth?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <StudentsClient students={serialized} classes={classes} />;
}
