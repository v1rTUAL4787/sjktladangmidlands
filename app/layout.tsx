import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "SJKT Ladang Midlands Portal",
  description: "School portal for SJKT Ladang Midlands — parents, teachers, and students.",
  icons: { icon: "https://saoqnwdydwomigkgjciz.supabase.co/storage/v1/object/public/SJKTPublic/logo%20circle.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
