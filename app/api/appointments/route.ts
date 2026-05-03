import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { notifyAppointmentConfirmed } from "@/lib/whatsapp/notifications";
import { format } from "date-fns";
import { z } from "zod";

const schema = z.object({
  slotId: z.string().uuid(),
  teacherId: z.string().uuid(),
  parentId: z.string().uuid(),
  studentId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { slotId, teacherId, parentId, studentId, notes } = parsed.data;

  const slot = await prisma.teacherSlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.booked || slot.slotType !== "CONSULTATION") {
    return NextResponse.json({ error: "Slot not available" }, { status: 409 });
  }

  const [appointment] = await prisma.$transaction([
    prisma.appointment.create({
      data: { slotId, teacherId, parentId, studentId, notes, status: "PENDING" },
    }),
    prisma.teacherSlot.update({ where: { id: slotId }, data: { booked: true } }),
  ]);

  const parent = await prisma.parentProfile.findUnique({
    where: { id: parentId },
    include: { user: { select: { fullName: true } } },
  });
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherId },
    include: { user: { select: { fullName: true } } },
  });

  if (parent?.whatsappNumber && teacher) {
    notifyAppointmentConfirmed(
      parent.whatsappNumber,
      teacher.user.fullName,
      format(new Date(slot.date), "dd MMM yyyy"),
      format(new Date(slot.startTime), "HH:mm")
    ).catch(console.error);
  }

  return NextResponse.json({ ok: true, appointmentId: appointment.id });
}
