export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1B3A6B]">
      {children}
    </div>
  );
}
