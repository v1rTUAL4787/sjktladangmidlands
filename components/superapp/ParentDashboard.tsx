"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { format, getDaysInMonth } from "date-fns";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_LABEL = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const TP_COLORS = [
  "",
  "bg-red-500 text-white",
  "bg-orange-400 text-white",
  "bg-yellow-400 text-gray-800",
  "bg-blue-400 text-white",
  "bg-green-500 text-white",
  "bg-emerald-600 text-white",
];

interface AttendanceRecord { date: string; present: boolean }
interface ProgressRecord { subject: string; term: number; academicYear: number; tpScore: number | null; customScore: string | null }
interface TimetableSlot { day: string; period: number; startTime: string; endTime: string; subject: string; teacherName: string }
interface Student {
  id: string;
  fullName: string;
  relation: string;
  class: { year: number; name: string; timetable: TimetableSlot[] };
  attendanceRecords: AttendanceRecord[];
  progressRecords: ProgressRecord[];
}

const PERIOD_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];

function AttendanceGrid({ records }: { records: AttendanceRecord[] }) {
  const year = new Date().getFullYear();
  const lookup = new Map(records.map(r => [r.date.slice(0, 10), r.present]));

  return (
    <div className="overflow-x-auto -mx-1">
      <div className="min-w-max px-1">
        {/* Day number headers — 1–31 */}
        <div className="flex gap-px mb-1 ml-8">
          {Array.from({ length: 31 }, (_, i) => (
            <div key={i} className="w-6 text-center text-[9px] text-gray-400 font-medium">{i + 1}</div>
          ))}
        </div>
        {MONTHS.map((month, mi) => {
          const daysInMonth = getDaysInMonth(new Date(year, mi, 1));
          return (
            <div key={month} className="flex items-center gap-px mb-px">
              <div className="w-7 text-[10px] text-gray-400 font-medium shrink-0">{month}</div>
              {Array.from({ length: 31 }, (_, di) => {
                if (di >= daysInMonth) return <div key={di} className="w-6 h-6" />;
                const dateStr = `${year}-${String(mi + 1).padStart(2, "0")}-${String(di + 1).padStart(2, "0")}`;
                const val = lookup.get(dateStr);
                return (
                  <div key={di} title={dateStr}
                    className={`w-6 h-6 rounded-sm text-[9px] flex items-center justify-center font-bold
                      ${val === true ? "bg-green-500 text-white" : val === false ? "bg-red-400 text-white" : "bg-gray-100 text-gray-300"}`}>
                    {val === true ? "✓" : val === false ? "✗" : ""}
                  </div>
                );
              })}
            </div>
          );
        })}
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-sm bg-green-500 inline-block" /> Present</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-sm bg-red-400 inline-block" /> Absent</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-sm bg-gray-100 inline-block" /> No data</span>
        </div>
      </div>
    </div>
  );
}

function TPSection({ records }: { records: ProgressRecord[] }) {
  const subjects = [...new Set(records.map(r => r.subject))].sort();
  const periods = [...new Set(records.map(r => `${r.academicYear} T${r.term}`))].sort();

  if (subjects.length === 0) return (
    <p className="text-gray-400 text-sm text-center py-4">No progress records yet.</p>
  );

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-gray-500 font-medium pb-2 pr-3 min-w-[100px]">Subject</th>
            {periods.map(p => <th key={p} className="text-center text-gray-500 font-medium pb-2 px-1 whitespace-nowrap">{p}</th>)}
          </tr>
        </thead>
        <tbody>
          {subjects.map(subject => (
            <tr key={subject} className="border-t border-gray-100">
              <td className="py-2 pr-3 font-medium text-gray-700 text-xs">{subject}</td>
              {periods.map(period => {
                const rec = records.find(r => `${r.academicYear} T${r.term}` === period && r.subject === subject);
                return (
                  <td key={period} className="py-2 px-1 text-center">
                    {rec?.tpScore ? (
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${TP_COLORS[rec.tpScore]}`}>
                        TP{rec.tpScore}
                      </span>
                    ) : rec?.customScore ? (
                      <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold bg-gray-200 text-gray-600">{rec.customScore}</span>
                    ) : (
                      <span className="text-gray-200">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TimetableSection({ slots }: { slots: TimetableSlot[] }) {
  if (slots.length === 0) return (
    <p className="text-gray-400 text-sm text-center py-4">Timetable not uploaded yet.</p>
  );

  const periods = [...new Set(slots.map(s => s.period))].sort((a, b) => a - b);
  const slotMap = new Map(slots.map(s => [`${s.day}-${s.period}`, s]));

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-gray-400 font-medium pb-2 pr-2 w-8">P</th>
            {PERIOD_DAYS.map(d => (
              <th key={d} className="text-center text-gray-400 font-medium pb-2 px-1 min-w-[60px]">{d.slice(0, 3)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map(period => {
            const anySlot = slots.find(s => s.period === period);
            return (
              <tr key={period} className="border-t border-gray-100">
                <td className="py-1.5 pr-2 text-gray-400 font-bold">{period}</td>
                {PERIOD_DAYS.map(day => {
                  const slot = slotMap.get(`${day}-${period}`);
                  return (
                    <td key={day} className="py-1.5 px-1 text-center">
                      {slot ? (
                        <div className="rounded-lg bg-[#1B3A6B]/10 px-1 py-1">
                          <p className="font-semibold text-[#1B3A6B] text-[10px] leading-tight">{slot.subject}</p>
                          <p className="text-gray-400 text-[9px] leading-tight mt-0.5">{slot.startTime}</p>
                        </div>
                      ) : <span className="text-gray-200">—</span>}
                    </td>
                  );
                })}
                {anySlot && (
                  <td className="py-1.5 pl-1 text-gray-400 text-[9px] whitespace-nowrap hidden sm:table-cell">
                    {anySlot.startTime}–{anySlot.endTime}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ParentDashboard({ parentName, students }: { parentName: string; students: Student[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [activeStudent, setActiveStudent] = useState(0);
  const [section, setSection] = useState<"attendance" | "progress" | "timetable">("attendance");

  const student = students[activeStudent];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  const attendanceThisYear = student.attendanceRecords.filter(
    a => new Date(a.date).getFullYear() === new Date().getFullYear()
  );
  const presentCount = attendanceThisYear.filter(a => a.present).length;
  const absentCount = attendanceThisYear.filter(a => !a.present).length;
  const pct = attendanceThisYear.length > 0 ? Math.round(presentCount / attendanceThisYear.length * 100) : null;

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-[#1B3A6B] text-white px-4 pt-12 pb-5">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <p className="text-xs text-white/60">Welcome back</p>
            <p className="font-bold text-sm">{parentName}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Student selector */}
        {students.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {students.map((s, i) => (
              <button key={s.id} onClick={() => setActiveStudent(i)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${i === activeStudent ? "bg-white text-[#1B3A6B]" : "bg-white/10 text-white/70"}`}>
                {s.fullName.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student info card */}
      <div className="mx-4 -mt-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-[#1B3A6B] text-base">{student.fullName}</p>
            <p className="text-gray-400 text-xs">Year {student.class.year}{student.class.name} · {student.relation}</p>
          </div>
          {pct !== null && (
            <div className="text-right">
              <p className={`text-2xl font-bold ${pct >= 90 ? "text-green-500" : pct >= 75 ? "text-amber-500" : "text-red-500"}`}>{pct}%</p>
              <p className="text-xs text-gray-400">Attendance</p>
            </div>
          )}
        </div>
        {pct !== null && (
          <div className="flex gap-3 mt-3 text-xs">
            <span className="bg-green-50 text-green-700 rounded-full px-3 py-1 font-medium">{presentCount} days present</span>
            <span className="bg-red-50 text-red-600 rounded-full px-3 py-1 font-medium">{absentCount} days absent</span>
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mx-4 mt-4 bg-gray-200 rounded-xl p-1">
        {(["attendance", "progress", "timetable"] as const).map(s => (
          <button key={s} onClick={() => setSection(s)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-colors ${section === s ? "bg-white text-[#1B3A6B] shadow-sm" : "text-gray-500"}`}>
            {s === "attendance" ? "Attendance" : s === "progress" ? "Progress" : "Timetable"}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
        {section === "attendance" && (
          <>
            <p className="font-bold text-[#1B3A6B] text-sm mb-3">{new Date().getFullYear()} Attendance</p>
            <AttendanceGrid records={student.attendanceRecords} />
          </>
        )}
        {section === "progress" && (
          <>
            <p className="font-bold text-[#1B3A6B] text-sm mb-3">Tahap Penguasaan</p>
            <TPSection records={student.progressRecords} />
          </>
        )}
        {section === "timetable" && (
          <>
            <p className="font-bold text-[#1B3A6B] text-sm mb-3">Class Timetable — Year {student.class.year}{student.class.name}</p>
            <TimetableSection slots={student.class.timetable} />
          </>
        )}
      </div>
    </div>
  );
}
