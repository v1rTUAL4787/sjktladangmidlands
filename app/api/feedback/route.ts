import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: Request) {
  const { name, message, category, announcementId } = await req.json();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });
  await prisma.feedback.create({
    data: {
      name: name || null,
      message: category ? `[${category}] ${message}` : message,
      announcementId: announcementId || null,
    },
  });
  return NextResponse.json({ ok: true });
}
