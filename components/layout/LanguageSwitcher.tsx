"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "ta", label: "த" },
  { code: "ms", label: "BM" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(locale: string) {
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-primary-100/30 p-0.5">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code)}
          disabled={isPending}
          className="px-2 py-1 text-xs font-medium rounded text-primary-foreground opacity-70 hover:opacity-100 hover:bg-primary-600 transition-all"
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
