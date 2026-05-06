import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { randomUUID } from "crypto";
import QRCode from "qrcode";

export async function POST(req: Request) {
  const { parentName, studentName, carPlate, visitDate, visitTime, reason, teacherName } = await req.json();
  if (!parentName || !studentName || !carPlate || !visitDate || !visitTime || !reason || !teacherName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const qrCode = randomUUID();
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://polylearn.my"}/visitor/verify/${qrCode}`;

  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 400,
    margin: 2,
    color: { dark: "#1B3A6B", light: "#FFFFFF" },
  });

  const registration = await prisma.visitorRegistration.create({
    data: {
      parentName,
      studentName,
      carPlate,
      visitDate: new Date(visitDate),
      visitTime,
      reason,
      teacherName,
      qrCode,
    },
  });

  return NextResponse.json({ id: registration.id, qrUrl: qrDataUrl }, { status: 201 });
}
