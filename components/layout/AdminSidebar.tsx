"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, Heart,
  Megaphone, CalendarDays, ChevronLeft,
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
  const { open, close } = useSidebar();

  const navContent = (
    <>
      <div className="px-3 py-4 border-b">
        <Link href="/dashboard" onClick={close} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-3 w-3" /> Back to Portal
        </Link>
        <p className="text-sm font-bold text-primary mt-2">Admin Panel</p>
      </div>
      <nav className="flex flex-col gap-1 px-3 pt-4">
        {links.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} onClick={close}
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
      {/* Overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50" onClick={close} />}

      {/* Sidebar drawer — shown when open on all screen sizes */}
      <aside className={cn(
        "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-56 bg-white border-r shadow-xl transition-transform duration-200",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {navContent}
      </aside>

      {/* Spacer to push content right when sidebar is open on desktop */}
      <div className={cn(
        "hidden md:block shrink-0 transition-all duration-200",
        open ? "w-56" : "w-0"
      )} />
    </>
  );
}
