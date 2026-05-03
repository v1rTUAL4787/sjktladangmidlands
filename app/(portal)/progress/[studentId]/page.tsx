import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressChart } from "@/components/modules/ProgressChart";
import { AttendanceHeatmap } from "@/components/modules/AttendanceHeatmap";
import { AlertTriangle } from "lucide-react";

const TP_COLOURS = ["", "bg-red-100 text-red-700", "bg-orange-100 text-orange-700", "bg-yellow-100 text-yellow-700", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-emerald-100 text-emerald-700"];

export default async function StudentProgressPage({ params }: { params: { studentId: string } }) {
  const t = await getTranslations("progress");
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const student = await prisma.student.findUnique({
    where: { id: params.studentId },
    include: {
      class: true,
      progressRecords: { orderBy: [{ academicYear: "asc" }, { term: "asc" }] },
      attendanceRecords: { orderBy: { date: "asc" } },
    },
  });

  if (!student) notFound();

  const recordsBySubject = student.progressRecords.reduce<Record<string, typeof student.progressRecords>>((acc, r) => {
    if (!acc[r.subject]) acc[r.subject] = [];
    acc[r.subject].push(r);
    return acc;
  }, {});

  const currentYear = new Date().getFullYear();
  const attendanceThisYear = student.attendanceRecords.filter(
    (a) => new Date(a.date).getFullYear() === currentYear
  );
  const attendancePct = attendanceThisYear.length > 0
    ? Math.round((attendanceThisYear.filter((a) => a.present).length / attendanceThisYear.length) * 100)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">{student.fullName}</h1>
        <p className="text-muted-foreground">
          Std {student.class.year}{student.class.name} · {student.class.academicYear}
          {attendancePct !== null && ` · Attendance: ${attendancePct}%`}
        </p>
      </div>

      {/* Progress by subject */}
      <section>
        <h2 className="text-lg font-semibold mb-4">{t("tp_score")} by Subject</h2>
        {Object.keys(recordsBySubject).length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("no_records")}</p>
        ) : (
          <div className="grid gap-4">
            {Object.entries(recordsBySubject).map(([subject, records]) => (
              <Card key={subject}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {records.map((r) => (
                      <div key={r.id} className="text-center">
                        <p className="text-xs text-muted-foreground">{r.academicYear} T{r.term}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${r.tpScore ? TP_COLOURS[r.tpScore] : "bg-secondary"}`}>
                          {r.tpScore ? `TP${r.tpScore}` : r.customScore ?? "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                  {records.some((r) => r.requiredAttention) && (
                    <div className="flex items-start gap-2 text-crimson bg-crimson/10 rounded-md p-2 text-sm mb-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>{records.find((r) => r.requiredAttention)?.requiredAttention}</p>
                    </div>
                  )}
                  {records.find((r) => r.actionPlan) && (
                    <p className="text-sm"><span className="font-medium">{t("action_plan")}:</span> {records.find((r) => r.actionPlan)?.actionPlan}</p>
                  )}
                  {records.find((r) => r.nextMilestone) && (
                    <p className="text-sm mt-1"><span className="font-medium">{t("next_milestone")}:</span> {records.find((r) => r.nextMilestone)?.nextMilestone}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* YoY Chart */}
      {student.progressRecords.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">{t("yoy_chart")}</h2>
          <ProgressChart records={student.progressRecords} />
        </section>
      )}

      {/* Attendance */}
      <section>
        <h2 className="text-lg font-semibold mb-4">{t("attendance")}</h2>
        <AttendanceHeatmap records={student.attendanceRecords} />
      </section>
    </div>
  );
}
