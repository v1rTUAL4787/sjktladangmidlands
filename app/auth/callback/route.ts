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

  // Check if already fully registered
  const existing = await prisma.user.findUnique({ where: { supabaseId } });
  if (existing) {
    const dest = next ?? (existing.role === "PARENT" ? "/parent" : "/admin");
    return NextResponse.redirect(`${origin}${dest}`);
  }

  // Pre-registered by admin (supabaseId starts with "pre:")
  const preRegistered = await prisma.user.findUnique({ where: { email } });
  if (preRegistered && preRegistered.supabaseId.startsWith("pre:")) {
    // Stamp in the real Supabase ID
    await prisma.user.update({ where: { id: preRegistered.id }, data: { supabaseId } });
    // Sync metadata to Supabase
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(supabaseId, {
      user_metadata: { role: preRegistered.role, fullName: preRegistered.fullName },
    });
    const dest = next ?? (preRegistered.role === "PARENT" ? "/parent" : "/admin");
    return NextResponse.redirect(`${origin}${dest}`);
  }

  // Teacher roster check — auto-register if email is on the roster
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

  // Not pre-registered and not on roster — sign them out and reject
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/login?error=not_registered`);
}
