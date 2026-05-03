import { prisma } from "@/lib/prisma/client";
import { ClassesClient } from "@/components/admin/classes/ClassesClient";

export default async function ClassesPage() {
  const [classes, teachers] = await Promise.all([
    prisma.class.findMany({
      include: {
        classTeacher: { include: { user: { select: { fullName: true } } } },
        _count: { select: { students: true } },
      },
      orderBy: [{ academicYear: "desc" }, { year: "asc" }, { name: "asc" }],
    }),
    prisma.teacherProfile.findMany({
      include: { user: { select: { fullName: true } } },
      orderBy: { user: { fullName: "asc" } },
    }),
  ]);

  return <ClassesClient classes={classes} teachers={teachers} />;
}
