"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function MobilePage({ title, children, color = "bg-[#1B3A6B]" }: {
  title: string;
  children: React.ReactNode;
  color?: string;
}) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className={`${color} text-white px-4 pt-12 pb-5 sticky top-0 z-10`}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
      </div>
      <div className="px-4 py-6">{children}</div>
    </div>
  );
}
