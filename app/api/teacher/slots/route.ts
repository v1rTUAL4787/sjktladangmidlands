import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const schema = z.object({
  teacherId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotType: z.enum(["CONSULTATION", "CLASS", "SCHOOL_DUTY", "BLOCKED"]),
  label: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id } });
  if (!dbUser || (dbUser.role !== "TEACHER" && dbUser.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { teacherId, date, startTime, endTime, slotType, label } = parsed.data;

  const slot = await prisma.teacherSlot.create({
    data: {
      teacherId,
      date: new Date(date),
      startTime: new Date(`${date}T${startTime}:00`),
      endTime: new Date(`${date}T${endTime}:00`),
      slotType,
      label,
    },
  });

  return NextResponse.json({ ok: true, slotId: slot.id });
}
