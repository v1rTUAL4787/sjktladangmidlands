import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";

export async function PUT(req: Request, { params }: { params: { parentId: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { fullName, relation, whatsapp, studentId } = await req.json();

  if (!fullName?.trim()) {
    return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  }

  // Fetch parent profile to get userId and verify it exists
  const profile = await prisma.parentProfile.findUnique({
    where: { id: params.parentId },
    select: { id: true, userId: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Parent not found" }, { status: 404 });
  }

  // Update user's fullName and phone
  await prisma.user.update({
    where: { id: profile.userId },
    data: {
      fullName: fullName.trim(),
      phone: whatsapp?.trim() || null,
    },
  });

  // Update whatsappNumber on ParentProfile
  await prisma.parentProfile.update({
    where: { id: params.parentId },
    data: { whatsappNumber: whatsapp?.trim() || "" },
  });

  // Update relation on the specific ParentStudent record
  if (relation && studentId) {
    await prisma.parentStudent.update({
      where: { parentId_studentId: { parentId: params.parentId, studentId } },
      data: { relation },
    });
  }

  return NextResponse.json({ ok: true });
}
