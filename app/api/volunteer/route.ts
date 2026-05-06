import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: Request) {
  const { name, email, phone, skills, availability, message } = await req.json();
  if (!name || !email || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const signup = await prisma.volunteerSignup.create({
    data: { name, email, phone, skills: skills || "", availability: availability || "", message: message || null },
  });
  return NextResponse.json(signup, { status: 201 });
}
