import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { FeedbackForm } from "@/components/modules/FeedbackForm";
import { Pin } from "lucide-react";

async function getAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
    take: 20,
    include: { author: { select: { fullName: true } } },
  });
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const ts = await getTranslations("school");
  const announcements = await getAnnouncements();

  return (
    <div className="bg-[#EEF7EE]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://saoqnwdydwomigkgjciz.supabase.co/storage/v1/object/public/SJKTPublic/logo%20circle.svg" alt="School Badge" className="h-36 mix-blend-luminosity drop-shadow-lg" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("hero_title")}</h1>
            <p className="text-lg opacity-80 mb-2">{t("hero_subtitle")}</p>
            <div className="mt-6 flex gap-3">
              <Button asChild variant="gold" size="lg" className="font-semibold shadow">
                <Link href="/login">{t("login_button")}</Link>
              </Button>
              <Button asChild size="lg"
                className="bg-[#EEF7EE] text-primary font-semibold hover:bg-[#d6efd6] border border-[#c2e4c2] shadow">
                <Link href="/about">About School</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="bg-[#EEF7EE] w-full px-4 py-12">
        <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold text-primary mb-6">{t("feed_title")}</h2>

        {announcements.length === 0 ? (
          <p className="text-muted-foreground">No announcements yet.</p>
        ) : (
          <div className="grid gap-4">
            {announcements.map((ann) => (
              <Card key={ann.id} className={ann.pinned ? "border-gold-500 border-2" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{ann.title}</CardTitle>
                    <div className="flex gap-2 shrink-0">
                      {ann.pinned && (
                        <Badge variant="gold" className="gap-1">
                          <Pin className="h-3 w-3" /> Pinned
                        </Badge>
                      )}
                      {ann.source === "FB_SEED" && (
                        <Badge variant="accent">Facebook</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(ann.publishedAt), { addSuffix: true })}
                    {" · "}{ann.author.fullName}
                  </p>
                </CardHeader>
                <CardContent>
                  {ann.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ann.imageUrl} alt={ann.title}
                      className="rounded-md mb-3 w-full object-cover max-h-60" />
                  )}
                  <p className="text-sm text-foreground line-clamp-3">{ann.body}</p>
                  <Link href={`/announcements/${ann.id}`}
                    className="text-sm text-accent hover:underline mt-2 inline-block">
                    Read more →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* Feedback */}
      <section className="bg-[#d6efd6] py-12 px-4">
        <div className="container mx-auto max-w-xl">
          <h2 className="text-2xl font-bold text-primary mb-6">{t("feedback_title")}</h2>
          <FeedbackForm />
        </div>
      </section>
    </div>
  );
}
