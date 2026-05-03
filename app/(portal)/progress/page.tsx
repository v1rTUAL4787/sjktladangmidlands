import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProgressPage() {
  const t = await getTranslations("progress");
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: {
      parentProfile: {
        include: { students: { include: { student: { include: { class: true } } } } },
      },
      teacherProfile: {
        include: { classes: { include: { students: true } } },
      },
    },
  });

  if (!dbUser) redirect("/login");

  const students =
    dbUser.role === "PARENT"
      ? dbUser.parentProfile?.students.map((ps) => ps.student) ?? []
      : dbUser.role === "TEACHER"
      ? dbUser.teacherProfile?.classes.flatMap((c) => c.students) ?? []
      : await prisma.student.findMany({ include: { class: true } });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">{t("title")}</h1>

      {students.length === 0 ? (
        <p className="text-muted-foreground">{t("no_records")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {students.map((student) => (
            <Link key={student.id} href={`/progress/${student.id}`}>
              <Card className="hover:border-accent hover:shadow-md transition-all cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{student.fullName}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground flex justify-between">
                  <span>Std {"class" in student && student.class ? `${student.class.year}${student.class.name}` : "—"}</span>
                  <Badge variant="secondary">View Progress →</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
