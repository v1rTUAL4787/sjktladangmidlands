export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#EEF7EE] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://saoqnwdydwomigkgjciz.supabase.co/storage/v1/object/public/SJKTPublic/badge.png" alt="SJKT Ladang Midlands" className="h-20 object-contain drop-shadow" />
        <h1 className="text-xl font-bold text-primary">SJKT Ladang Midlands</h1>
        <p className="text-sm text-muted-foreground">polylearn.my</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
