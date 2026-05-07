"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  Megaphone, CalendarDays, Phone, CalendarCheck,
  QrCode, Heart, Users, Lightbulb, MessageSquare, ChevronRight, Pin, GraduationCap
} from "lucide-react";

interface Announcement {
  id: string; title: string; body: string; imageUrl: string | null;
  publishedAt: Date; pinned: boolean;
}
interface Event {
  id: string; title: string; description: string | null;
  date: Date; location: string | null;
}

const tiles = [
  { href: "/announcements", icon: Megaphone,     label: "Announcements",  color: "bg-[#00A0C0]" },
  { href: "/events",        icon: CalendarDays,  label: "Events",         color: "bg-[#1B3A6B]" },
  { href: "/contact",       icon: Phone,         label: "Contact School", color: "bg-[#0f7a94]" },
  { href: "/appointments",  icon: CalendarCheck, label: "Appointment",    color: "bg-[#F5B800] text-[#1B3A6B]" },
  { href: "/visitor",       icon: QrCode,        label: "Visitor Entry",  color: "bg-[#1B3A6B]" },
  { href: "/donate",        icon: Heart,         label: "Donate",         color: "bg-rose-500" },
  { href: "/volunteer",     icon: Users,         label: "Volunteer",      color: "bg-emerald-600" },
  { href: "/ideas",         icon: Lightbulb,     label: "Share Idea",     color: "bg-amber-500" },
  { href: "/feedback",      icon: MessageSquare,  label: "Feedback",       color: "bg-[#00A0C0]" },
  { href: "/parent",        icon: GraduationCap,  label: "Parents",        color: "bg-[#1B3A6B]" },
];

export function SuperAppHome({ announcements, events }: { announcements: Announcement[]; events: Event[] }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const delta = startY.current - e.changedTouches[0].clientY;
    if (delta > 40) setSheetOpen(true);
    if (delta < -40) setSheetOpen(false);
  }

  const pinnedAnn = announcements.filter(a => a.pinned);
  const latestAnn = announcements.filter(a => !a.pinned).slice(0, 6);
  const displayAnn = [...pinnedAnn, ...latestAnn].slice(0, 6);

  return (
    <div className="relative min-h-screen max-w-md mx-auto overflow-hidden select-none"
      style={{ background: "linear-gradient(160deg, #1B3A6B 0%, #0f2240 100%)" }}>

      {/* Watermark logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://saoqnwdydwomigkgjciz.supabase.co/storage/v1/object/public/SJKTPublic/logoblue.svg"
          alt=""
          className="w-72 opacity-[0.07]"
        />
      </div>

      {/* Top status bar area */}
      <div className="relative z-10 px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-white/60 text-xs font-medium tracking-wide uppercase">SJKT Ladang Midlands</p>
            <h1 className="text-white text-xl font-bold leading-tight">Shah Alam, Selangor</h1>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://saoqnwdydwomigkgjciz.supabase.co/storage/v1/object/public/SJKTPublic/logoblue.svg"
            alt="SJKT"
            className="h-10 opacity-90"
          />
        </div>
      </div>

      {/* Announcement cards (horizontal scroll) */}
      <div className="relative z-10 px-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/80 text-sm font-semibold">Latest Announcements</p>
          <Link href="/announcements" className="text-[#F5B800] text-xs font-medium flex items-center gap-0.5">
            See all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {displayAnn.length === 0 ? (
            <div className="rounded-2xl bg-white/10 p-4 min-w-[220px] snap-start">
              <p className="text-white/60 text-sm">No announcements yet.</p>
            </div>
          ) : (
            displayAnn.map(ann => (
              <Link key={ann.id} href={`/announcements/${ann.id}`}
                className="rounded-2xl overflow-hidden min-w-[220px] max-w-[220px] snap-start shrink-0 bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
                {ann.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ann.imageUrl} alt={ann.title} className="w-full h-24 object-cover" />
                )}
                <div className="p-3">
                  {ann.pinned && (
                    <span className="inline-flex items-center gap-1 text-[#F5B800] text-xs mb-1">
                      <Pin className="h-2.5 w-2.5" /> Pinned
                    </span>
                  )}
                  <p className="text-white text-xs font-semibold line-clamp-2 leading-snug">{ann.title}</p>
                  <p className="text-white/50 text-xs mt-1">
                    {formatDistanceToNow(new Date(ann.publishedAt), { addSuffix: true })}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Upcoming events strip */}
      {events.length > 0 && (
        <div className="relative z-10 px-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/80 text-sm font-semibold">Upcoming Events</p>
            <Link href="/events" className="text-[#F5B800] text-xs font-medium flex items-center gap-0.5">
              See all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {events.slice(0, 3).map(ev => (
              <div key={ev.id} className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/10 px-4 py-3">
                <div className="rounded-lg bg-[#F5B800] text-[#1B3A6B] text-center px-2 py-1 min-w-[40px]">
                  <p className="text-xs font-bold leading-none">{format(new Date(ev.date), "dd")}</p>
                  <p className="text-[10px] font-medium leading-none mt-0.5">{format(new Date(ev.date), "MMM")}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{ev.title}</p>
                  {ev.location && <p className="text-white/50 text-xs truncate">{ev.location}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pull-up hint */}
      <div className="relative z-10 flex flex-col items-center gap-2 mt-6 pb-6"
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <p className="text-white/40 text-xs">Swipe up for services</p>
        <div className="flex flex-col gap-0.5 items-center">
          <div className="w-8 h-0.5 rounded-full bg-white/20" />
          <div className="w-5 h-0.5 rounded-full bg-white/15" />
        </div>
      </div>

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        className={`fixed inset-x-0 bottom-0 z-30 max-w-md mx-auto rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out ${sheetOpen ? "translate-y-0" : "translate-y-[calc(100%-5rem)]"}`}
        style={{ maxHeight: "85vh" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-pointer" onClick={() => setSheetOpen(o => !o)}>
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pb-2">
          <h2 className="text-sm font-bold text-[#1B3A6B] tracking-wide uppercase">All Services</h2>
        </div>

        <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: "calc(85vh - 5rem)" }}>
          <div className="grid grid-cols-3 gap-4 pt-2">
            {tiles.map(({ href, icon: Icon, label, color }) => (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-2 group"
                onClick={() => setSheetOpen(false)}>
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-md group-active:scale-95 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
                </div>
                <span className="text-[11px] font-medium text-gray-600 text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center text-xs text-gray-300">
            © {new Date().getFullYear()} SJKT Ladang Midlands · Yath AI Labs
          </div>
        </div>
      </div>

      {/* Persistent bottom peek — always shows grid even when sheet is closed */}
      {!sheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-20 max-w-md mx-auto">
          <div className="bg-white rounded-t-3xl px-5 pt-3 pb-4 shadow-2xl">
            <div className="flex justify-center mb-3 cursor-pointer" onClick={() => setSheetOpen(true)}>
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="grid grid-cols-5 gap-3">
              {tiles.slice(0, 5).map(({ href, icon: Icon, label, color }) => (
                <Link key={href} href={href} className="flex flex-col items-center gap-1.5 group">
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shadow group-active:scale-95 transition-transform`}>
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 text-center leading-tight line-clamp-1">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
