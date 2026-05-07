"use client";

import { createClient } from "@/lib/supabase/client";
import { Chrome, GraduationCap, ChevronLeft } from "lucide-react";
import Link from "next/link";

export function ParentLoginGate({ notRegistered }: { notRegistered?: boolean }) {
  const supabase = createClient();

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/parent` },
    });
  }

  return (
    <div className="min-h-screen max-w-md mx-auto flex flex-col" style={{ background: "linear-gradient(160deg, #1B3A6B 0%, #0f2240 100%)" }}>
      <div className="px-5 pt-10">
        <Link href="/" className="inline-flex items-center gap-1 text-white/60 text-sm hover:text-white">
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-16 gap-8">
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://saoqnwdydwomigkgjciz.supabase.co/storage/v1/object/public/SJKTPublic/logoblue.svg" alt="SJKT" className="h-20 opacity-90" />
          <div className="text-center">
            <p className="text-white font-bold text-xl">Parents Portal</p>
            <p className="text-white/50 text-sm mt-1">SJKT Ladang Midlands</p>
          </div>
        </div>

        <div className="w-full bg-white/10 backdrop-blur-sm rounded-3xl p-6 flex flex-col gap-4 border border-white/10">
          {notRegistered ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-red-400" />
              </div>
              <p className="text-white font-semibold text-center">Account Not Registered</p>
              <p className="text-white/50 text-sm text-center">Your Google account is not linked to any student. Please contact the school admin.</p>
              <button onClick={handleGoogleLogin} className="w-full mt-2 flex items-center justify-center gap-2 bg-white text-[#1B3A6B] rounded-xl py-3 font-semibold text-sm active:opacity-80">
                <Chrome className="h-4 w-4" /> Try a different account
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <p className="text-white font-semibold">Sign in to view your child&apos;s progress</p>
                <p className="text-white/50 text-xs mt-1">Use the Google account registered with the school</p>
              </div>
              <button onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white text-[#1B3A6B] rounded-xl py-3.5 font-bold text-sm active:opacity-80 shadow-lg">
                <Chrome className="h-4 w-4" />
                Continue with Google
              </button>
              <p className="text-white/30 text-xs text-center">Only registered parents can access this portal</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
