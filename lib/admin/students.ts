import { prisma } from "@/lib/prisma/client";
import { randomUUID } from "crypto";

export interface ParentInput {
  name: string;
  email: string;
  whatsapp?: string;
  relation?: string;
}

/**
 * For each ParentInput: if email already exists in DB link them.
 * Otherwise create a Prisma User with a placeholder supabaseId so the
 * parent can sign in with Google later — the auth callback will stamp
 * in their real Supabase ID at first login.
 */
export async function linkParentsToStudent(studentId: string, parents: ParentInput[]): Promise<number> {
  let created = 0;

  for (const p of parents) {
    if (!p.email || !p.name) continue;

    const existingUser = await prisma.user.findUnique({ where: { email: p.email } });

    if (existingUser) {
      let profile = await prisma.parentProfile.findUnique({ where: { userId: existingUser.id } });
      // Create profile if user exists but has no parentProfile yet
      if (!profile) {
        profile = await prisma.parentProfile.create({
          data: {
            userId: existingUser.id,
            whatsappNumber: p.whatsapp ?? "",
            approved: true,
            approvedAt: new Date(),
          },
        });
      }
      await prisma.parentStudent.upsert({
        where: { parentId_studentId: { parentId: profile.id, studentId } },
        update: {},
        create: { parentId: profile.id, studentId, relation: p.relation ?? "Parent" },
      });
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          supabaseId: `pre:${randomUUID()}`,
          email: p.email,
          fullName: p.name,
          role: "PARENT",
          phone: p.whatsapp ?? null,
        },
      });
      const profile = await tx.parentProfile.create({
        data: {
          userId: user.id,
          whatsappNumber: p.whatsapp ?? "",
          approved: true,
          approvedAt: new Date(),
        },
      });
      await tx.parentStudent.create({
        data: { parentId: profile.id, studentId, relation: p.relation ?? "Parent" },
      });
    });

    created++;
  }

  return created;
}
