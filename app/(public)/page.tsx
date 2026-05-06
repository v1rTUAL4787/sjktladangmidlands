import { prisma } from "@/lib/prisma/client";
import { SuperAppHome } from "@/components/superapp/SuperAppHome";

export default async function HomePage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    take: 10,
    select: {
      id: true,
      title: true,
      body: true,
      imageUrl: true,
      publishedAt: true,
      pinned: true,
    },
  });

  const events = await prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 5,
  });

  return <SuperAppHome announcements={announcements} events={events} />;
}
