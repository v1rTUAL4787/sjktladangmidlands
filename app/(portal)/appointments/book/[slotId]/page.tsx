import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BookAppointmentForm } from "@/components/modules/BookAppointmentForm";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BookAppointmentPage({ params }: { params: { slotId: string } }) {
  const t = await getTranslations("appointments");
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const slot = await prisma.teacherSlot.findUnique({
    where: { id: params.slotId },
    include: { teacher: { include: { user: { select: { fullName: true } } } } },
  });

  if (!slot || slot.booked) notFound();

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: {
      parentProfile: {
        include: { students: { include: { student: { select: { id: true, fullName: true } } } } },
      },
    },
  });

  if (!dbUser?.parentProfile) redirect("/dashboard");

  const students = dbUser.parentProfile.students.map((ps) => ps.student);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">{t("book_slot")}</h1>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><span className="font-medium">Teacher:</span> {slot.teacher.user.fullName}</p>
          <p><span className="font-medium">Date:</span> {format(new Date(slot.date), "EEEE, dd MMMM yyyy")}</p>
          <p><span className="font-medium">Time:</span> {format(new Date(slot.startTime), "HH:mm")} – {format(new Date(slot.endTime), "HH:mm")}</p>
        </CardContent>
      </Card>

      <BookAppointmentForm
        slotId={slot.id}
        teacherId={slot.teacherId}
        parentId={dbUser.parentProfile.id}
        students={students}
      />
    </div>
  );
}
