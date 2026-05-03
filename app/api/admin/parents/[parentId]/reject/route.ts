import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_: Request, { params }: { params: { parentId: string } }) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id } });
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parent = await prisma.parentProfile.findUnique({
    where: { id: params.parentId },
    include: { user: true },
  });
  if (!parent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.user.delete({ where: { id: parent.userId } });

  const adminSupabase = createAdminClient();
  await adminSupabase.auth.admin.deleteUser(parent.user.supabaseId);

  return NextResponse.json({ ok: true });
}
