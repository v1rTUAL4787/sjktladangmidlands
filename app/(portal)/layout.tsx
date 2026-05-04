import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: { id: true, fullName: true, email: true, role: true },
  });

  if (!dbUser) redirect("/login");

  const parentProfile = dbUser.role === "PARENT"
    ? await prisma.parentProfile.findUnique({
        where: { userId: dbUser.id },
        select: { approved: true },
      })
    : null;

  if (dbUser.role === "PARENT" && parentProfile && !parentProfile.approved) {
    redirect("/register?step=pending");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar user={dbUser} />
        <div className="flex flex-1">
          <Sidebar role={dbUser.role as "ADMIN" | "TEACHER" | "PARENT"} />
          <main className="flex-1 p-6 bg-surface">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
