import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

const schema = z.object({
  name: z.string().max(100).optional(),
  message: z.string().min(1).max(1000),
  announcementId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await prisma.feedback.create({ data: parsed.data });
  return NextResponse.json({ ok: true });
}
