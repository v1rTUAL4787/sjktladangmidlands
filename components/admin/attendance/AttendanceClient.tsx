"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, RotateCw } from "lucide-react";
import { format } from "date-fns";

interface AttendanceRow {
  id: string;
  date: string;
  present: boolean;
  reason: string | null;
  studentId: string;
  studentName: string;
  cardNo: string | null;
  classYear: number;
  className: string;
}

interface ClassItem {
  id: string;
  year: number;
  name: string;
}

interface Props {
  initialRecords: AttendanceRow[];
  classes: ClassItem[];
  initialDate: string;
}

export function AttendanceClient({ initialRecords, classes, initialDate }: Props) {
  const [records, setRecords] = useState<AttendanceRow[]>(initialRecords);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [date, setDate] = useState(initialDate);
  const [studentName, setStudentName] = useState("");
  const [classId, setClassId] = useState("");
  const [cardNo, setCardNo] = useState("");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      if (studentName.trim()) params.set("studentName", studentName.trim());
      if (classId && classId !== "__all__") params.set("classId", classId);
      if (cardNo.trim()) params.set("cardNo", cardNo.trim());

      const res = await fetch(`/api/admin/attendance?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } finally {
      setLoading(false);
    }
  }, [date, studentName, classId, cardNo]);

  // Re-fetch when date or classId changes (immediate triggers)
  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, classId]);

  const handleSearch = () => {
    fetchRecords();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchRecords();
  };

  const resetFilters = () => {
    setDate(initialDate);
    setStudentName("");
    setClassId("");
    setCardNo("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and filter student attendance records.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="filter-date" className="text-xs font-medium">
              Date
            </Label>
            <Input
              id="filter-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Student Name */}
          <div className="space-y-1.5">
            <Label htmlFor="filter-student" className="text-xs font-medium">
              Student Name
            </Label>
            <Input
              id="filter-student"
              placeholder="Search by name..."
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Class */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Class</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger>
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    Year {c.year} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Card No */}
          <div className="space-y-1.5">
            <Label htmlFor="filter-card" className="text-xs font-medium">
              Card No
            </Label>
            <Input
              id="filter-card"
              placeholder="Search card no..."
              value={cardNo}
              onChange={(e) => setCardNo(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            {records.length} record{records.length !== 1 ? "s" : ""} found
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSearch} disabled={loading}>
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Card No</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No attendance records found.
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(r.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">{r.studentName}</TableCell>
                  <TableCell>
                    Year {r.classYear} {r.className}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.cardNo || "—"}
                  </TableCell>
                  <TableCell>
                    {r.present ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        Present
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Absent</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {r.reason || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
