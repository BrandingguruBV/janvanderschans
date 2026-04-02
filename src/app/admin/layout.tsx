import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap gap-4 border-b border-[#d4c4a8] pb-4 text-sm font-medium">
        <Link href="/admin" className="text-[#3d2e24] hover:underline">
          Dashboard
        </Link>
        <Link href="/admin/purchases" className="text-[#3d2e24] hover:underline">
          Alle aankopen
        </Link>
        <Link href="/admin/integrations" className="text-[#3d2e24] hover:underline">
          Koppelingen
        </Link>
        <Link href="/" className="ml-auto text-[#8a7a68] hover:underline">
          ← Winkel
        </Link>
      </nav>
      {children}
    </div>
  );
}
