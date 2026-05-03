import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TrendingUp, Calendar, Image, ShieldCheck } from "lucide-react";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: {
      parentProfile: {
        include: {
          students: { include: { student: { include: { class: true } } } },
        },
      },
    },
  });

  if (!dbUser) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: dbUser.id, read: false },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const quickLinks = [
    { href: "/progress", icon: TrendingUp, label: t("quick_links"), sublabel: "Child Progress" },
    { href: "/appointments", icon: Calendar, label: "Appointments", sublabel: "Book consultations" },
    { href: "/activities", icon: Image, label: "Activities", sublabel: "Gallery & submissions" },
    ...(dbUser.role === "ADMIN" ? [{ href: "/admin", icon: ShieldCheck, label: "Admin", sublabel: "Manage portal" }] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">
        {t("welcome", { name: dbUser.fullName })}
      </h1>

      {/* Parent: show linked children */}
      {dbUser.role === "PARENT" && dbUser.parentProfile && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{t("your_children")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dbUser.parentProfile.students.map(({ student, relation }) => (
              <Card key={student.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{student.fullName}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground flex justify-between">
                  <span>Std {student.class.year}{student.class.name} · {student.class.academicYear}</span>
                  <Badge variant="secondary">{relation}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Quick links */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map(({ href, icon: Icon, label, sublabel }) => (
            <Link key={href} href={href}>
              <Card className="hover:border-accent hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                  <Icon className="h-8 w-8 text-primary" />
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{sublabel}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{t("notifications")}</h2>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("no_notifications")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <Card key={n.id} className="border-accent/30">
                <CardContent className="py-3 px-4 flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                  </div>
                  {n.link && (
                    <Link href={n.link} className="text-xs text-accent hover:underline shrink-0 ml-3">View</Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
