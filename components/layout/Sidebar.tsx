"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
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

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r bg-white pt-6">
      <nav className="flex flex-col gap-1 px-3">
        {links.map(({ href, icon: Icon, key }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith(href) && href !== "/dashboard"
                ? "bg-primary text-primary-foreground"
                : pathname === href && href === "/dashboard"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-secondary"
            )}
          >
            <Icon className="h-4 w-4" />
            {t(key)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
