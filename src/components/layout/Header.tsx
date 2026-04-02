import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CartBadge } from "@/components/layout/CartBadge";
import { getShopVisualPaths } from "@/lib/shop-visuals";

export async function Header() {
  const session = await getServerSession(authOptions);
  const [ambient] = getShopVisualPaths(1);

  return (
    <header
      className="animate-reveal-up relative overflow-hidden border-b border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-[var(--shadow-soft)] backdrop-blur-xl"
      style={{ "--reveal-delay": "0ms" } as CSSProperties}
    >
      {ambient ? (
        <div className="pointer-events-none absolute inset-0 opacity-[0.09]" aria-hidden>
          <Image
            src={ambient}
            alt=""
            fill
            className="object-cover object-right blur-[2px]"
            sizes="100vw"
            unoptimized={ambient.endsWith(".svg")}
            priority={false}
          />
        </div>
      ) : null}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4 px-[max(1rem,env(safe-area-inset-left))] py-3 pr-[max(1rem,env(safe-area-inset-right))] min-[520px]:flex-row min-[520px]:flex-wrap min-[520px]:items-center min-[520px]:justify-between min-[520px]:gap-3 min-[520px]:py-4 md:px-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1 min-[520px]:flex-row min-[520px]:items-baseline min-[520px]:gap-4 md:gap-6">
          <Link
            href="/"
            className="min-w-0 truncate font-[family-name:var(--font-display)] text-lg font-semibold tracking-[0.02em] text-[var(--fg)] transition-colors hover:text-[var(--accent)] min-[400px]:text-xl md:text-2xl"
          >
            Jan van der Schans
          </Link>
          <p
            className="animate-reveal-fade hidden max-w-xs text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--fg-soft)] min-[520px]:block md:text-xs md:tracking-[0.22em]"
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            Vintage · uit uw catalogusbeelden
          </p>
        </div>
        <nav
          className="flex w-full min-w-0 flex-wrap items-stretch gap-2 text-sm font-medium text-[var(--fg-muted)] min-[520px]:w-auto min-[520px]:justify-end min-[520px]:gap-1 md:gap-2"
          aria-label="Hoofdnavigatie"
        >
          <CartBadge />
          {session?.user ? (
            <>
              <Link
                href="/account"
                className="nav-link-premium inline-flex min-h-10 items-center justify-center rounded-md px-3 py-2 transition-colors hover:bg-white/55 hover:text-[var(--fg)]"
              >
                Account
              </Link>
              {session.user.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="nav-link-premium inline-flex min-h-10 items-center justify-center rounded-md px-3 py-2 transition-colors hover:bg-white/55 hover:text-[var(--fg)]"
                >
                  Beheer
                </Link>
              ) : null}
              <Link
                href="/api/auth/signout"
                className="nav-link-premium inline-flex min-h-10 items-center justify-center rounded-md px-3 py-2 transition-colors hover:bg-white/55 hover:text-[var(--fg)]"
              >
                Uitloggen
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="nav-link-premium inline-flex min-h-10 items-center justify-center rounded-md px-3 py-2 transition-colors hover:bg-white/55 hover:text-[var(--fg)]"
              >
                Inloggen
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-gradient-to-r from-[var(--fg)] via-[#2a2622] to-[var(--fg)] px-4 py-2 text-[#faf8f5] shadow-md transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent-dim)] active:scale-[0.98]"
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
