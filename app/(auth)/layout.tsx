export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#EEF7EE] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/badge.png" alt="SJKT Ladang Midlands" width={72} height={72} className="rounded-full shadow object-cover" />
        <h1 className="text-xl font-bold text-primary">SJKT Ladang Midlands</h1>
        <p className="text-sm text-muted-foreground">polylearn.my</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
