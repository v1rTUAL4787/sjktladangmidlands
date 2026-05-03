"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface Props {
  parentId: string;
  action: "approve" | "reject";
}

export function ApproveParentButton({ parentId, action }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch(`/api/admin/parents/${parentId}/${action}`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      size="sm"
      variant={action === "approve" ? "default" : "outline"}
      onClick={handleClick}
      disabled={loading}
      className={action === "reject" ? "border-crimson text-crimson hover:bg-crimson/10" : ""}
    >
      {loading ? "..." : action === "approve" ? t("approve") : t("reject")}
    </Button>
  );
}
