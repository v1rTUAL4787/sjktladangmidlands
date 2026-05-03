import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ApproveParentButton } from "@/components/modules/ApproveParentButton";
import { format } from "date-fns";

export default async function AdminPage() {
  const t = await getTranslations("admin");
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id } });
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/dashboard");

  const pendingParents = await prisma.parentProfile.findMany({
    where: { approved: false },
    include: {
      user: { select: { fullName: true, email: true, createdAt: true } },
      students: { include: { student: { select: { fullName: true, class: { select: { year: true, name: true } } } } } },
    },
    orderBy: { user: { createdAt: "asc" } },
  });

  const stats = await Promise.all([
    prisma.user.count(),
    prisma.student.count(),
    prisma.announcement.count(),
    prisma.appointment.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: stats[0] },
          { label: "Students", value: stats[1] },
          { label: "Announcements", value: stats[2] },
          { label: "Pending Appts", value: stats[3] },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <p className="text-3xl font-bold text-primary">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild><Link href="/admin/announcements/new">+ New Announcement</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/classes">Manage Classes</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/users">All Users</Link></Button>
      </div>

      {/* Pending parents */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          {t("pending_parents")}
          {pendingParents.length > 0 && (
            <Badge variant="destructive" className="ml-2">{pendingParents.length}</Badge>
          )}
        </h2>

        {pendingParents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending approvals.</p>
        ) : (
          <div className="grid gap-3">
            {pendingParents.map((parent) => (
              <Card key={parent.id}>
                <CardContent className="flex items-start justify-between py-4 gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{parent.user.fullName}</p>
                    <p className="text-sm text-muted-foreground">{parent.user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Registered: {format(new Date(parent.user.createdAt), "dd MMM yyyy HH:mm")}
                    </p>
                    {parent.students.map(({ student, relation }) => (
                      <p key={student.fullName} className="text-xs mt-1">
                        Child: <span className="font-medium">{student.fullName}</span>
                        {" · "}Std {student.class?.year}{student.class?.name}
                        {" · "}{relation}
                      </p>
                    ))}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <ApproveParentButton parentId={parent.id} action="approve" />
                    <ApproveParentButton parentId={parent.id} action="reject" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
