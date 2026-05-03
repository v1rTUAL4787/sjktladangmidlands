"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FeedbackForm({ announcementId }: { announcementId?: string }) {
  const t = useTranslations("home");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message, announcementId }),
    });
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-accent bg-accent/10 p-4 text-center text-accent font-medium">
        {t("feedback_success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        required
        placeholder={t("feedback_placeholder")}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Sending..." : t("feedback_submit")}
      </Button>
    </form>
  );
}
