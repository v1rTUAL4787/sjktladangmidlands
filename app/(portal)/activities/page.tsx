import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Image } from "lucide-react";

export default async function ActivitiesPage() {
  const t = await getTranslations("activities");
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: { teacherProfile: true, parentProfile: { include: { students: true } } },
  });
  if (!dbUser) redirect("/login");

  const activities = await prisma.activity.findMany({
    orderBy: { date: "desc" },
    include: {
      class: true,
      teacher: { include: { user: { select: { fullName: true } } } },
      _count: { select: { submissions: true, mediaItems: true } },
    },
  });

  const isTeacher = dbUser.role === "TEACHER" || dbUser.role === "ADMIN";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>
        {isTeacher && (
          <Button asChild>
            <Link href="/activities/new">
              <Plus className="h-4 w-4 mr-1" /> New Activity
            </Link>
          </Button>
        )}
      </div>

      {activities.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("no_activities")}</p>
      ) : (
        <div className="grid gap-4">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{activity.title}</CardTitle>
                  <div className="flex gap-2 shrink-0">
                    {activity.requiresSubmission && (
                      <Badge variant="gold">Submission Required</Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(activity.date), "dd MMM yyyy")}
                  {activity.class && ` · Std ${activity.class.year}${activity.class.name}`}
                  {" · "}{activity.teacher.user.fullName}
                </p>
              </CardHeader>
              <CardContent>
                {activity.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{activity.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Image className="h-3 w-3" /> {activity._count.mediaItems} media
                    </span>
                    {activity.requiresSubmission && (
                      <span>{activity._count.submissions} submissions</span>
                    )}
                    {activity.dueDate && (
                      <span>{t("due_date")}: {format(new Date(activity.dueDate), "dd MMM")}</span>
                    )}
                  </div>
                  <Link href={`/activities/${activity.id}`} className="text-xs text-accent hover:underline">
                    {t("view_gallery")} →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
