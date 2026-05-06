import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: Request) {
  const { name, email, phone, teacherName, preferredDate, preferredTime, message } = await req.json();
  if (!name || !email || !phone || !teacherName || !preferredDate || !preferredTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const appt = await prisma.appointmentRequest.create({
    data: { name, email, phone, teacherName, preferredDate, preferredTime, message: message || null },
  });
  return NextResponse.json(appt, { status: 201 });
}
