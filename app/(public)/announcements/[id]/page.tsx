import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FeedbackForm } from "@/components/modules/FeedbackForm";
import { format } from "date-fns";
import { ArrowLeft, Pin } from "lucide-react";

export default async function AnnouncementPage({ params }: { params: { id: string } }) {
  const ann = await prisma.announcement.findUnique({
    where: { id: params.id },
    include: { author: { select: { fullName: true } } },
  });

  if (!ann) notFound();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-accent hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex items-start gap-2 mb-2">
        <h1 className="text-3xl font-bold text-primary flex-1">{ann.title}</h1>
        {ann.pinned && <Badge variant="gold"><Pin className="h-3 w-3 mr-1" />Pinned</Badge>}
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        {format(new Date(ann.publishedAt), "dd MMMM yyyy")} · {ann.author.fullName}
      </p>

      {ann.imageUrl && (
        <Image src={ann.imageUrl} alt={ann.title} width={800} height={400}
          className="rounded-lg w-full object-cover mb-6" />
      )}

      <div className="prose max-w-none text-foreground whitespace-pre-wrap mb-10">
        {ann.body}
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Leave Feedback</h2>
        <FeedbackForm announcementId={ann.id} />
      </div>
    </div>
  );
}
