import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma/client";
import { encryptIC, hashIC } from "@/lib/crypto";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(2).max(100),
  whatsapp: z.string().regex(/^60\d{8,11}$/),
  icNumber: z.string().regex(/^\d{12}$/),
  relation: z.string().min(1),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { fullName, whatsapp, icNumber, relation } = parsed.data;

  const icHash = hashIC(icNumber);
  const student = await prisma.student.findUnique({ where: { icNumberHash: icHash } });

  if (!student) {
    return NextResponse.json({ error: "No student found with that IC number. Please contact the school admin." }, { status: 404 });
  }

  const existing = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id } });
  if (existing) {
    return NextResponse.json({ error: "Account already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      supabaseId: supabaseUser.id,
      email: supabaseUser.email!,
      fullName,
      role: "PARENT",
      parentProfile: {
        create: {
          whatsappNumber: whatsapp,
          approved: false,
          students: {
            create: {
              studentId: student.id,
              relation,
            },
          },
        },
      },
    },
  });

  const adminSupabase = createAdminClient();
  await adminSupabase.auth.admin.updateUserById(supabaseUser.id, {
    user_metadata: { role: "PARENT", fullName },
  });

  return NextResponse.json({ ok: true, userId: user.id });
}
