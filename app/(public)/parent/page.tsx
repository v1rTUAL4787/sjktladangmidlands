import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { ParentLoginGate } from "@/components/superapp/ParentLoginGate";
import { ParentDashboard } from "@/components/superapp/ParentDashboard";

export default async function ParentPage({ searchParams }: { searchParams: { error?: string } }) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) return <ParentLoginGate notRegistered={searchParams.error === "not_registered"} />;

  const dbUser = await (prisma.user.findUnique as Function)({
    where: { supabaseId: supabaseUser.id },
    include: {
      parentProfile: {
        include: {
          students: {
            include: {
              student: {
                include: {
                  class: { include: { timetable: { orderBy: [{ day: "asc" }, { period: "asc" }] } } },
                  progressRecords: { orderBy: [{ academicYear: "asc" }, { term: "asc" }] },
                  attendanceRecords: { orderBy: { date: "asc" } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!dbUser || dbUser.role !== "PARENT" || !dbUser.parentProfile) {
    return <ParentLoginGate notRegistered />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const students = dbUser.parentProfile.students.map((ps: any) => ({
    ...ps.student,
    relation: ps.relation,
    dateOfBirth: ps.student.dateOfBirth?.toISOString() ?? null,
    createdAt: ps.student.createdAt.toISOString(),
    updatedAt: ps.student.updatedAt.toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attendanceRecords: ps.student.attendanceRecords.map((a: any) => ({
      ...a,
      date: a.date.toISOString(),
    })),
  }));

  return <ParentDashboard parentName={dbUser.fullName} students={students} />;
}
