"use client";

import { format, startOfYear, eachDayOfInterval, endOfYear } from "date-fns";

interface AttendanceRecord {
  date: Date;
  present: boolean;
}

export function AttendanceHeatmap({ records }: { records: AttendanceRecord[] }) {
  const year = new Date().getFullYear();
  const days = eachDayOfInterval({ start: startOfYear(new Date(year, 0, 1)), end: endOfYear(new Date(year, 0, 1)) });

  const lookup = new Map(records.map((r) => [format(new Date(r.date), "yyyy-MM-dd"), r.present]));

  const months = Array.from({ length: 12 }, (_, i) => {
    const monthDays = days.filter((d) => d.getMonth() === i);
    return { month: format(new Date(year, i, 1), "MMM"), days: monthDays };
  });

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {months.map(({ month, days: mDays }) => (
          <div key={month}>
            <p className="text-xs text-muted-foreground mb-1 text-center">{month}</p>
            <div className="flex gap-0.5">
              {mDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const val = lookup.get(key);
                return (
                  <div
                    key={key}
                    title={`${key}: ${val === undefined ? "No data" : val ? "Present" : "Absent"}`}
                    className={`w-3 h-3 rounded-sm ${
                      val === undefined ? "bg-secondary" : val ? "bg-accent" : "bg-crimson"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-accent inline-block" /> Present</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-crimson inline-block" /> Absent</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-secondary inline-block" /> No data</span>
      </div>
    </div>
  );
}
