import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CartBadge } from "@/components/layout/CartBadge";

export async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b border-[#d4c4a8] bg-[#faf7f2]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[#2c1810]">
          Jan van der Schans
        </Link>
        <p className="hidden text-sm text-[#5c4a3a] sm:block">Vintage camera&apos;s &amp; accessoires</p>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm font-medium text-[#3d2e24]">
          <CartBadge />
          {session?.user ? (
            <>
              <Link href="/account" className="rounded-md px-2 py-1 hover:bg-[#ebe3d6]">
                Account
              </Link>
              {session.user.role === "ADMIN" ? (
                <Link href="/admin" className="rounded-md px-2 py-1 hover:bg-[#ebe3d6]">
                  Beheer
                </Link>
              ) : null}
              <Link href="/api/auth/signout" className="rounded-md px-2 py-1 hover:bg-[#ebe3d6]">
                Uitloggen
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-2 py-1 hover:bg-[#ebe3d6]">
                Inloggen
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[#3d2e24] px-3 py-1.5 text-[#faf7f2] hover:bg-[#2c1810]"
              >
                Registreren
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
