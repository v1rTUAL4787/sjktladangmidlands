import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: Request) {
  const { name, email, amount, purpose, message } = await req.json();
  if (!name || !email || !amount || !purpose) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const donation = await prisma.donation.create({
    data: { name, email, amount: parseFloat(amount), purpose, message: message || null },
  });
  return NextResponse.json(donation, { status: 201 });
}
