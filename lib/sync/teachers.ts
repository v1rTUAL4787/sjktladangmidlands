import { prisma } from "@/lib/prisma/client";

export interface TeacherRow {
  fullName: string;
  email: string;
  teacherRole?: string;
  subjects?: string;
  assignedClass?: string; // e.g. "3A" or "Year 3A"
  academicYear?: string;
}

const VALID_ROLES = ["CLASS_TEACHER", "SUBJECT_TEACHER", "PENOLONG_KANAN", "HEADMISTRESS"];

function normaliseRole(raw?: string): "CLASS_TEACHER" | "SUBJECT_TEACHER" | "PENOLONG_KANAN" | "HEADMISTRESS" {
  if (!raw) return "SUBJECT_TEACHER";
  const upper = raw.trim().toUpperCase().replace(/\s+/g, "_");
  return VALID_ROLES.includes(upper) ? upper as ReturnType<typeof normaliseRole> : "SUBJECT_TEACHER";
}

function parseClass(raw?: string): { year: number; name: string } | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^year\s*/i, "");
  const match = cleaned.match(/^(\d)([A-Za-z]?)$/);
  if (!match) return null;
  return { year: parseInt(match[1]), name: match[2]?.toUpperCase() || "A" };
}

export async function syncTeachers(rows: TeacherRow[], academicYear: string) {
  let upserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const email = row.email?.trim().toLowerCase();
    const fullName = row.fullName?.trim();

    if (!email || !fullName) { errors.push(`Skipped: missing email or fullName`); skipped++; continue; }

    try {
      const teacherRole = normaliseRole(row.teacherRole);
      const subjects = row.subjects ? row.subjects.split(",").map(s => s.trim()).filter(Boolean) : [];
      const parsedClass = parseClass(row.assignedClass);

      // Find class if specified
      let classId: string | null = null;
      if (parsedClass) {
        const cls = await prisma.class.findFirst({
          where: { year: parsedClass.year, name: parsedClass.name, academicYear },
        });
        if (cls) classId = cls.id;
        else errors.push(`Warning: class "${row.assignedClass}" not found for ${email} — skipping class assignment`);
      }

      // Check if a User with this email already exists (teacher already registered)
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        // Update their TeacherProfile if it exists
        if (existingUser.role === "TEACHER") {
          await prisma.teacherProfile.upsert({
            where: { userId: existingUser.id },
            update: { teacherRole, subjects },
            create: { userId: existingUser.id, teacherRole, subjects },
          });
          if (classId) {
            await prisma.class.update({ where: { id: classId }, data: { classTeacherId: (await prisma.teacherProfile.findUnique({ where: { userId: existingUser.id } }))!.id } });
          }
          await prisma.user.update({ where: { id: existingUser.id }, data: { fullName } });
        }
      } else {
        // Pre-register: store in a roster table so when they sign up, they're auto-linked
        await prisma.teacherRoster.upsert({
          where: { email },
          update: { fullName, teacherRole, subjects, assignedClassId: classId, academicYear },
          create: { email, fullName, teacherRole, subjects, assignedClassId: classId, academicYear },
        });
      }

      upserted++;
    } catch (e) {
      errors.push(`Error on ${row.email}: ${(e as Error).message}`);
      skipped++;
    }
  }

  return { upserted, skipped, errors };
}
