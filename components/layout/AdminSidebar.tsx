"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, Heart,
  Megaphone, CalendarDays, ChevronLeft, Menu, X,
} from "lucide-react";

const links = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/classes", icon: BookOpen, label: "Classes" },
  { href: "/admin/students", icon: Users, label: "Students" },
  { href: "/admin/teachers", icon: GraduationCap, label: "Teachers" },
  { href: "/admin/parents", icon: Heart, label: "Parents" },
  { href: "/admin/announcements", icon: Megaphone, label: "Announcements" },
  { href: "/admin/events", icon: CalendarDays, label: "Events" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navContent = (
    <>
      <div className="px-3 py-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors" onClick={() => setOpen(false)}>
          <ChevronLeft className="h-3 w-3" /> Back to Portal
        </Link>
        <p className="text-sm font-bold text-primary mt-2">Admin Panel</p>
      </div>
      <nav className="flex flex-col gap-1 px-3 pt-4">
        {links.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-primary-foreground shadow-md"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        "md:hidden fixed top-0 left-0 z-40 h-full w-56 bg-white border-r shadow-xl transition-transform duration-200",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16" />
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen border-r bg-white shrink-0">
        {navContent}
      </aside>
    </>
  );
}
