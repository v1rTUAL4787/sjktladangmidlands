import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: Request) {
  const { name, email, title, idea } = await req.json();
  if (!title || !idea) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const submission = await prisma.ideaSubmission.create({
    data: { name: name || null, email: email || null, title, idea },
  });
  return NextResponse.json(submission, { status: 201 });
}
