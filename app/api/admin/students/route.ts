import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/admin/auth";
import { hashIC, encryptIC } from "@/lib/crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  const students = await prisma.student.findMany({
    where: classId ? { classId } : {},
    include: {
      class: { select: { year: true, name: true } },
      parents: { include: { parent: { include: { user: { select: { fullName: true } } } } } },
    },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { fullName, icNumber, dateOfBirth, gender, classId, enrolledYear, parent } = await req.json();
  if (!fullName || !icNumber || !classId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const hash = hashIC(icNumber);
  const existing = await prisma.student.findUnique({ where: { icNumberHash: hash } });
  if (existing) return NextResponse.json({ error: "Student with this IC already exists" }, { status: 409 });

  const student = await prisma.student.create({
    data: {
      fullName,
      icNumberHash: hash,
      icNumberEncrypted: encryptIC(icNumber),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      classId,
      enrolledYear: enrolledYear ?? new Date().getFullYear(),
    },
  });

  if (!parent?.email || !parent?.name) {
    return NextResponse.json(student, { status: 201 });
  }

  // Check if a user with this email already exists
  const existingUser = await prisma.user.findUnique({ where: { email: parent.email } });

  if (existingUser) {
    const parentProfile = await prisma.parentProfile.findUnique({ where: { userId: existingUser.id } });
    if (parentProfile) {
      await prisma.parentStudent.upsert({
        where: { parentId_studentId: { parentId: parentProfile.id, studentId: student.id } },
        update: {},
        create: { parentId: parentProfile.id, studentId: student.id, relation: parent.relation ?? "Parent" },
      });
      return NextResponse.json({ ...student, parentLinked: true }, { status: 201 });
    }
  }

  // Create new Supabase auth account via invite
  const supabaseAdmin = createAdminClient();
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(parent.email, {
    data: { fullName: parent.name, role: "PARENT" },
  });

  if (inviteError || !inviteData?.user) {
    // Student was created — don't roll back, just report parent error
    return NextResponse.json({ ...student, parentError: inviteError?.message ?? "Failed to invite parent" }, { status: 201 });
  }

  const supabaseId = inviteData.user.id;

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        supabaseId,
        email: parent.email,
        fullName: parent.name,
        role: "PARENT",
        phone: parent.whatsapp ?? null,
      },
    });
    const parentProfile = await tx.parentProfile.create({
      data: {
        userId: user.id,
        whatsappNumber: parent.whatsapp ?? "",
        approved: true,
        approvedAt: new Date(),
      },
    });
    await tx.parentStudent.create({
      data: { parentId: parentProfile.id, studentId: student.id, relation: parent.relation ?? "Parent" },
    });
  });

  return NextResponse.json({ ...student, parentInviteSent: true }, { status: 201 });
}
