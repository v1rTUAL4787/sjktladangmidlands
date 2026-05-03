import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";
import { AddSlotForm } from "@/components/modules/AddSlotForm";

export default async function NewSlotPage() {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: { teacherProfile: true },
  });

  if (!dbUser?.teacherProfile) redirect("/dashboard");

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">Add Schedule Slot</h1>
      <AddSlotForm teacherId={dbUser.teacherProfile.id} />
    </div>
  );
}
