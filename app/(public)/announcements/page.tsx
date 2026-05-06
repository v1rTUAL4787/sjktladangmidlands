import { prisma } from "@/lib/prisma/client";
import { MobilePage } from "@/components/superapp/MobilePage";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Pin } from "lucide-react";

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    take: 30,
    select: { id: true, title: true, body: true, imageUrl: true, publishedAt: true, pinned: true },
  });

  return (
    <MobilePage title="Announcements" color="bg-[#00A0C0]">
      <div className="flex flex-col gap-4">
        {announcements.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-12">No announcements yet.</p>
        )}
        {announcements.map(ann => (
          <Link key={ann.id} href={`/announcements/${ann.id}`}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">
            {ann.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ann.imageUrl} alt={ann.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              {ann.pinned && (
                <span className="inline-flex items-center gap-1 text-[#F5B800] text-xs font-semibold mb-1">
                  <Pin className="h-3 w-3" /> Pinned
                </span>
              )}
              <h2 className="font-bold text-[#1B3A6B] text-base leading-snug">{ann.title}</h2>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{ann.body}</p>
              <p className="text-gray-300 text-xs mt-2">
                {formatDistanceToNow(new Date(ann.publishedAt), { addSuffix: true })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </MobilePage>
  );
}
