"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ProgressRecord {
  subject: string;
  term: number;
  academicYear: number;
  tpScore: number | null;
}

const COLOURS = ["#1B3A6B", "#00A0C0", "#F5B800", "#C41E3A", "#2D1B69", "#059669", "#7C3AED"];

export function ProgressChart({ records }: { records: ProgressRecord[] }) {
  const subjects = [...new Set(records.map((r) => r.subject))];
  const periods = [...new Set(records.map((r) => `${r.academicYear} T${r.term}`))].sort();

  const data = periods.map((period) => {
    const entry: Record<string, string | number> = { period };
    subjects.forEach((subject) => {
      const rec = records.find((r) => `${r.academicYear} T${r.term}` === period && r.subject === subject);
      if (rec?.tpScore) entry[subject] = rec.tpScore;
    });
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 6]} ticks={[1, 2, 3, 4, 5, 6]} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        {subjects.map((subject, i) => (
          <Line key={subject} type="monotone" dataKey={subject}
            stroke={COLOURS[i % COLOURS.length]} strokeWidth={2}
            dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
