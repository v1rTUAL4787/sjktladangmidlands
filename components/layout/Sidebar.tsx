"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import {
  LayoutDashboard, TrendingUp, Calendar, Image, ShieldCheck, BookOpen
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
  const { open, close } = useSidebar();

  if (pathname.startsWith("/admin")) return null;

  const navLinks = (
    <nav className="flex flex-col gap-1 px-3 pt-4">
      {links.map(({ href, icon: Icon, key }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} onClick={close}
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
      {/* Overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50" onClick={close} />}

      {/* Sidebar drawer — shown when open on all screen sizes */}
      <aside className={cn(
        "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-56 bg-white border-r shadow-xl transition-transform duration-200",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {navLinks}
      </aside>

      {/* Spacer to push content right when sidebar is open on desktop */}
      <div className={cn(
        "hidden md:block shrink-0 transition-all duration-200",
        open ? "w-56" : "w-0"
      )} />
    </>
  );
}
