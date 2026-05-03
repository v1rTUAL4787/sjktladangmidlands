import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

const statusVariant = {
  PENDING: "secondary",
  CONFIRMED: "accent",
  CANCELLED: "destructive",
  COMPLETED: "default",
} as const;

export default async function AppointmentsPage() {
  const t = await getTranslations("appointments");
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: { parentProfile: true },
  });
  if (!dbUser) redirect("/login");

  const appointments = dbUser.parentProfile
    ? await prisma.appointment.findMany({
        where: { parentId: dbUser.parentProfile.id },
        include: {
          slot: true,
          student: { select: { fullName: true } },
          teacher: { include: { user: { select: { fullName: true } } } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const availableTeachers = await prisma.teacherProfile.findMany({
    include: {
      user: { select: { fullName: true } },
      slots: {
        where: { slotType: "CONSULTATION", booked: false, date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 3,
      },
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>

      {/* Available slots */}
      <section>
        <h2 className="text-lg font-semibold mb-4">{t("available_slots")}</h2>
        {availableTeachers.filter((tc) => tc.slots.length > 0).length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("no_slots")}</p>
        ) : (
          <div className="grid gap-3">
            {availableTeachers
              .filter((tc) => tc.slots.length > 0)
              .map((tc) => (
                <Card key={tc.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{tc.user.fullName}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {tc.slots.map((slot) => (
                      <Link key={slot.id} href={`/appointments/book/${slot.id}`}>
                        <Button size="sm" variant="outline">
                          {format(new Date(slot.date), "dd MMM")} · {format(new Date(slot.startTime), "HH:mm")}–{format(new Date(slot.endTime), "HH:mm")}
                        </Button>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </section>

      {/* My appointments */}
      <section>
        <h2 className="text-lg font-semibold mb-4">{t("my_appointments")}</h2>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No appointments yet.</p>
        ) : (
          <div className="grid gap-3">
            {appointments.map((appt) => (
              <Card key={appt.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{appt.teacher.user.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(appt.slot.date), "dd MMM yyyy")} · {format(new Date(appt.slot.startTime), "HH:mm")}
                      {" · "}{appt.student.fullName}
                    </p>
                    {appt.notes && <p className="text-xs text-muted-foreground mt-1">"{appt.notes}"</p>}
                  </div>
                  <Badge variant={statusVariant[appt.status] as "secondary" | "accent" | "destructive" | "default"}>
                    {t(`status_${appt.status.toLowerCase()}` as any)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
