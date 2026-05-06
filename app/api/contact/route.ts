import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: Request) {
  const { name, email, phone, message } = await req.json();
  if (!name || !email || !message) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  await prisma.feedback.create({
    data: { name, message: `[CONTACT ENQUIRY] ${phone ? `Ph: ${phone} | ` : ""}${message}` },
  });
  return NextResponse.json({ ok: true });
}
