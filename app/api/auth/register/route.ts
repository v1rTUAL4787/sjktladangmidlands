import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma/client";
import { encryptIC, hashIC } from "@/lib/crypto";
import { z } from "zod";

const parentSchema = z.object({
  type: z.literal("parent").optional(),
  fullName: z.string().min(2).max(100),
  whatsapp: z.string().regex(/^60\d{8,11}$/),
  icNumber: z.string().regex(/^\d{12}$/),
  relation: z.string().min(1),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const email = supabaseUser.email!.toLowerCase();

  // Check if this email is in the teacher roster — auto-link as teacher
  const roster = await prisma.teacherRoster.findUnique({ where: { email } });
  if (roster) {
    const existing = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id } });
    if (existing) return NextResponse.json({ error: "Account already registered" }, { status: 409 });

    const user = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email,
        fullName: roster.fullName,
        role: "TEACHER",
        teacherProfile: {
          create: {
            teacherRole: roster.teacherRole,
            subjects: roster.subjects,
          },
        },
      },
    });

    // Assign class if pre-configured
    if (roster.assignedClassId) {
      const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
      if (profile) {
        await prisma.class.update({ where: { id: roster.assignedClassId }, data: { classTeacherId: profile.id } });
      }
    }

    const adminSupabase = createAdminClient();
    await adminSupabase.auth.admin.updateUserById(supabaseUser.id, {
      user_metadata: { role: "TEACHER", fullName: roster.fullName },
    });

    return NextResponse.json({ ok: true, role: "TEACHER", userId: user.id });
  }

  // Otherwise register as parent
  const body = await request.json();
  const parsed = parentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const { fullName, whatsapp, icNumber, relation } = parsed.data;
  const icHash = hashIC(icNumber);
  const student = await prisma.student.findUnique({ where: { icNumberHash: icHash } });
  if (!student) return NextResponse.json({ error: "No student found with that IC number. Please contact the school admin." }, { status: 404 });

  const existing = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id } });
  if (existing) return NextResponse.json({ error: "Account already registered" }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      supabaseId: supabaseUser.id,
      email,
      fullName,
      role: "PARENT",
      parentProfile: {
        create: {
          whatsappNumber: whatsapp,
          approved: false,
          students: { create: { studentId: student.id, relation } },
        },
      },
    },
  });

  const adminSupabase = createAdminClient();
  await adminSupabase.auth.admin.updateUserById(supabaseUser.id, {
    user_metadata: { role: "PARENT", fullName },
  });

  return NextResponse.json({ ok: true, role: "PARENT", userId: user.id });
}
