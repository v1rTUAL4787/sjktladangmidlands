import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { syncTeachers } from "@/lib/sync/teachers";

// Google Sheets CSV export URL format:
// https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}
// Sheet must be shared as "Anyone with the link can view"

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { sheetsUrl, academicYear } = await req.json();
  if (!sheetsUrl) return NextResponse.json({ error: "sheetsUrl is required" }, { status: 400 });

  let csvUrl = sheetsUrl;
  // Convert share URL to CSV export URL if needed
  const match = sheetsUrl.match(/\/spreadsheets\/d\/([^/]+)/);
  if (match && !sheetsUrl.includes("export?format=csv")) {
    const gidMatch = sheetsUrl.match(/[?&]gid=(\d+)/);
    const gid = gidMatch ? gidMatch[1] : "0";
    csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`;
  }

  let csv: string;
  try {
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);
    csv = await res.text();
  } catch (e) {
    return NextResponse.json({ error: `Could not fetch Google Sheet: ${(e as Error).message}` }, { status: 400 });
  }

  // Parse CSV into rows
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  const rows = lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });

  const teacherRows = rows.map(r => ({
    fullName: String(r["fullName"] ?? r["Full Name"] ?? "").trim(),
    email: String(r["email"] ?? r["Email"] ?? "").trim().toLowerCase(),
    teacherRole: String(r["teacherRole"] ?? r["Teacher Role"] ?? "").trim(),
    subjects: String(r["subjects"] ?? r["Subjects"] ?? "").trim(),
    assignedClass: String(r["assignedClass"] ?? r["Assigned Class"] ?? "").trim(),
    academicYear: String(academicYear ?? new Date().getFullYear()),
  }));

  const result = await syncTeachers(teacherRows, String(academicYear ?? new Date().getFullYear()));
  return NextResponse.json(result);
}
