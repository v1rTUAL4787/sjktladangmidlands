import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ParentInput {
  name: string;
  email: string;
  whatsapp?: string;
  relation?: string;
}

/**
 * For each ParentInput: if email already exists in DB, link them.
 * Otherwise invite via Supabase admin, create User + ParentProfile, link.
 * Returns number of new Supabase invites sent.
 */
export async function linkParentsToStudent(studentId: string, parents: ParentInput[]): Promise<number> {
  let invitesSent = 0;
  const supabaseAdmin = createAdminClient();

  for (const p of parents) {
    if (!p.email || !p.name) continue;

    const existingUser = await prisma.user.findUnique({ where: { email: p.email } });

    if (existingUser) {
      const profile = await prisma.parentProfile.findUnique({ where: { userId: existingUser.id } });
      if (profile) {
        await prisma.parentStudent.upsert({
          where: { parentId_studentId: { parentId: profile.id, studentId } },
          update: {},
          create: { parentId: profile.id, studentId, relation: p.relation ?? "Parent" },
        });
      }
      continue;
    }

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(p.email, {
      data: { fullName: p.name, role: "PARENT" },
    });
    if (error || !data?.user) continue;

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          supabaseId: data.user.id,
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

    invitesSent++;
  }

  return invitesSent;
}
