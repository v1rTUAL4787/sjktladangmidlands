import { prisma } from "@/lib/prisma/client";
import { MobilePage } from "@/components/superapp/MobilePage";
import { format } from "date-fns";
import { MapPin } from "lucide-react";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
  });

  const upcoming = events.filter(e => new Date(e.date) >= new Date());
  const past = events.filter(e => new Date(e.date) < new Date());

  return (
    <MobilePage title="Events & Agenda" color="bg-[#1B3A6B]">
      <div className="flex flex-col gap-6">
        {upcoming.length === 0 && past.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-12">No events yet.</p>
        )}

        {upcoming.length > 0 && (
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Upcoming</p>
            <div className="flex flex-col gap-3">
              {upcoming.map(ev => (
                <div key={ev.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden">
                  <div className="bg-[#F5B800] text-[#1B3A6B] flex flex-col items-center justify-center px-4 py-3 min-w-[64px]">
                    <span className="text-2xl font-bold leading-none">{format(new Date(ev.date), "dd")}</span>
                    <span className="text-xs font-semibold">{format(new Date(ev.date), "MMM")}</span>
                    <span className="text-xs opacity-70">{format(new Date(ev.date), "yyyy")}</span>
                  </div>
                  <div className="p-4 flex-1 min-w-0">
                    <h3 className="font-bold text-[#1B3A6B] text-sm leading-snug">{ev.title}</h3>
                    {ev.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{ev.description}</p>}
                    {ev.location && (
                      <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{ev.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Past</p>
            <div className="flex flex-col gap-3 opacity-60">
              {past.map(ev => (
                <div key={ev.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden">
                  <div className="bg-gray-200 text-gray-500 flex flex-col items-center justify-center px-4 py-3 min-w-[64px]">
                    <span className="text-2xl font-bold leading-none">{format(new Date(ev.date), "dd")}</span>
                    <span className="text-xs font-semibold">{format(new Date(ev.date), "MMM")}</span>
                  </div>
                  <div className="p-4 flex-1 min-w-0">
                    <h3 className="font-bold text-gray-500 text-sm">{ev.title}</h3>
                    {ev.location && <p className="text-gray-400 text-xs mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </MobilePage>
  );
}
