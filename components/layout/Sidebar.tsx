"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, TrendingUp, Calendar, Image, ShieldCheck, BookOpen, Menu, X
} from "lucide-react";

interface SidebarProps {
  role: "ADMIN" | "TEACHER" | "PARENT";
}

const parentLinks = [
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/progress", icon: TrendingUp, key: "progress" },
  { href: "/appointments", icon: Calendar, key: "appointments" },
  { href: "/activities", icon: Image, key: "activities" },
];

const teacherLinks = [
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/progress", icon: TrendingUp, key: "progress" },
  { href: "/teacher/schedule", icon: Calendar, key: "appointments" },
  { href: "/activities", icon: BookOpen, key: "activities" },
];

const adminLinks = [
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/admin", icon: ShieldCheck, key: "admin" },
  { href: "/progress", icon: TrendingUp, key: "progress" },
  { href: "/appointments", icon: Calendar, key: "appointments" },
  { href: "/activities", icon: Image, key: "activities" },
];

const linksByRole = { PARENT: parentLinks, TEACHER: teacherLinks, ADMIN: adminLinks };

export function Sidebar({ role }: SidebarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const links = linksByRole[role];
  const [open, setOpen] = useState(false);

  const navLinks = (
    <nav className="flex flex-col gap-1 px-3 pt-4">
      {links.map(({ href, icon: Icon, key }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
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
            {t(key)}
          </Link>
        );
      })}
    </nav>
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
        <div className="h-16" /> {/* spacer for navbar */}
        {navLinks}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen border-r bg-white shrink-0">
        {navLinks}
      </aside>
    </>
  );
}
