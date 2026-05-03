import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { notifyParentApproved } from "@/lib/whatsapp/notifications";

export async function POST(_: Request, { params }: { params: { parentId: string } }) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id } });
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parent = await prisma.parentProfile.update({
    where: { id: params.parentId },
    data: { approved: true, approvedAt: new Date() },
    include: { user: { select: { fullName: true } } },
  });

  notifyParentApproved(parent.whatsappNumber, parent.user.fullName).catch(console.error);

  return NextResponse.json({ ok: true });
}
