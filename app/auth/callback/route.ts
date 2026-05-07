import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.redirect(`${origin}/login?error=auth_failed`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/login?error=auth_failed`);

  const supabaseId = data.user.id;
  const email = data.user.email!.toLowerCase();
  const next = searchParams.get("next") ?? null;

  // Already registered — just redirect
  const existing = await prisma.user.findUnique({ where: { supabaseId } });
  if (existing) {
    const dest = next ?? (existing.role === "PARENT" ? "/parent" : "/admin");
    return NextResponse.redirect(`${origin}${dest}`);
  }

  // Pre-registered by admin via student form (supabaseId starts with "pre:")
  const preRegistered = await prisma.user.findUnique({ where: { email } });
  if (preRegistered && preRegistered.supabaseId.startsWith("pre:")) {
    await prisma.user.update({ where: { id: preRegistered.id }, data: { supabaseId } });
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(supabaseId, {
      user_metadata: { role: preRegistered.role, fullName: preRegistered.fullName },
    });
    const dest = next ?? (preRegistered.role === "PARENT" ? "/parent" : "/admin");
    return NextResponse.redirect(`${origin}${dest}`);
  }

  // Parent whitelist check — email in ParentWhitelist = auto-register as PARENT
  const whitelisted = await (prisma as any).parentWhitelist.findUnique({
    where: { email },
    include: { children: true },
  });
  if (whitelisted) {
    const user = await prisma.user.create({
      data: {
        supabaseId,
        email,
        fullName: whitelisted.parentName,
        role: "PARENT",
        phone: whitelisted.phone ?? null,
        parentProfile: {
          create: {
            whatsappNumber: whitelisted.phone ?? "",
            approved: true,
            approvedAt: new Date(),
          },
        },
      },
      include: { parentProfile: true },
    });

    // Link whitelisted children by matching class if student exists
    for (const child of whitelisted.children) {
      const student = await prisma.student.findFirst({
        where: {
          fullName: { contains: child.childName, mode: "insensitive" },
          class: { year: child.classYear, name: child.className },
        },
      });
      if (student && user.parentProfile) {
        await prisma.parentStudent.upsert({
          where: { parentId_studentId: { parentId: user.parentProfile.id, studentId: student.id } },
          update: {},
          create: { parentId: user.parentProfile.id, studentId: student.id, relation: whitelisted.relation },
        });
        await (prisma as any).parentWhitelistChild.update({
          where: { id: child.id },
          data: { studentId: student.id },
        });
      }
    }

    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(supabaseId, {
      user_metadata: { role: "PARENT", fullName: whitelisted.parentName },
    });
    return NextResponse.redirect(`${origin}/parent`);
  }

  // Teacher roster check
  const roster = await prisma.teacherRoster.findUnique({ where: { email } });
  if (roster) {
    await prisma.user.create({
      data: {
        supabaseId,
        email,
        fullName: roster.fullName,
        role: "TEACHER",
        teacherProfile: {
          create: { teacherRole: roster.teacherRole, subjects: roster.subjects },
        },
      },
    });
    if (roster.assignedClassId) {
      const newUser = await prisma.user.findUnique({ where: { supabaseId } });
      const profile = newUser ? await prisma.teacherProfile.findUnique({ where: { userId: newUser.id } }) : null;
      if (profile) {
        await prisma.class.update({ where: { id: roster.assignedClassId }, data: { classTeacherId: profile.id } });
      }
    }
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(supabaseId, {
      user_metadata: { role: "TEACHER", fullName: roster.fullName },
    });
    return NextResponse.redirect(`${origin}/admin`);
  }

  // Unknown email — reject
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/parent?error=not_registered`);
}
