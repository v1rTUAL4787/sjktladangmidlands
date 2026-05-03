import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";

const slotTypeVariant = {
  CONSULTATION: "accent",
  CLASS: "default",
  SCHOOL_DUTY: "gold",
  BLOCKED: "secondary",
} as const;

export default async function TeacherSchedulePage() {
  const t = await getTranslations("appointments");
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: { teacherProfile: true },
  });

  if (!dbUser?.teacherProfile) redirect("/dashboard");

  const slots = await prisma.teacherSlot.findMany({
    where: { teacherId: dbUser.teacherProfile.id, date: { gte: new Date() } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    include: {
      appointment: {
        include: {
          student: { select: { fullName: true } },
          parent: { include: { user: { select: { fullName: true } } } },
        },
      },
    },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">{t("teacher_schedule")}</h1>
        <Button asChild>
          <Link href="/teacher/schedule/new">
            <Plus className="h-4 w-4 mr-1" /> {t("add_slot")}
          </Link>
        </Button>
      </div>

      {slots.length === 0 ? (
        <p className="text-muted-foreground text-sm">No upcoming slots. Add your first slot above.</p>
      ) : (
        <div className="grid gap-3">
          {slots.map((slot) => (
            <Card key={slot.id} className={slot.slotType === "CONSULTATION" && !slot.booked ? "border-accent/50" : ""}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">
                    {format(new Date(slot.date), "EEE, dd MMM yyyy")}
                    {" · "}
                    {format(new Date(slot.startTime), "HH:mm")}–{format(new Date(slot.endTime), "HH:mm")}
                  </p>
                  {slot.label && <p className="text-sm text-muted-foreground">{slot.label}</p>}
                  {slot.appointment && (
                    <p className="text-sm text-accent">
                      Booked by {slot.appointment.parent.user.fullName} · {slot.appointment.student.fullName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={slotTypeVariant[slot.slotType] as "accent" | "default" | "gold" | "secondary"}>
                    {t(`slot_type_${slot.slotType.toLowerCase().replace("_", "_")}` as any)}
                  </Badge>
                  {slot.slotType === "CONSULTATION" && slot.booked && (
                    <Badge variant="gold">Booked</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
