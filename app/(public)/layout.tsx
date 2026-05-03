import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  let user = null;
  if (supabaseUser) {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { fullName: true, email: true, role: true },
    });
    user = dbUser;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 bg-gradient-to-b from-[#1B3A6B] to-[#0f2240]">{children}</main>
      <footer className="border-t bg-primary text-primary-foreground py-6 text-center text-sm opacity-80">
        <p>© {new Date().getFullYear()} SJKT Ladang Midlands · polylearn.my</p>
      </footer>
    </div>
  );
}
