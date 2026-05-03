"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user?: { email: string; fullName: string; role: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const t = useTranslations("nav");
  const ts = useTranslations("school");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/badge.png" alt="School Badge" className="h-10 object-contain" />
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-tight">{ts("name")}</p>
            <p className="text-xs text-primary-100 opacity-80">{ts("location")}</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">{t("home")}</Link>
          <Link href="/announcements" className="opacity-80 hover:opacity-100 transition-opacity">{t("announcements")}</Link>
          <Link href="/about" className="opacity-80 hover:opacity-100 transition-opacity">{t("about")}</Link>
          {user && (
            <Link href="/dashboard" className="opacity-80 hover:opacity-100 transition-opacity">{t("dashboard")}</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}
              className="border-primary-100 text-primary-foreground hover:bg-primary-600">
              {t("logout")}
            </Button>
          ) : (
            <Button asChild size="sm" variant="gold">
              <Link href="/login">{t("login")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
