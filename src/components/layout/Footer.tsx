import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { getShopVisualPaths } from "@/lib/shop-visuals";

export async function Footer() {
  const strip = getShopVisualPaths(6);

  return (
    <footer
      className="animate-reveal-up relative mt-auto overflow-hidden border-t border-[var(--border-strong)] bg-gradient-to-b from-[var(--bg-elevated)] to-[#e8e2d8] py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center sm:py-12"
      style={{ "--reveal-delay": "180ms" } as CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex max-w-full flex-wrap justify-center gap-1.5 overflow-hidden px-2 py-2 opacity-[0.22] min-[400px]:gap-2 min-[400px]:py-3"
        aria-hidden
      >
        {strip.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative h-12 w-[4.5rem] shrink-0 overflow-hidden rounded border border-[var(--border)] shadow-sm min-[400px]:h-14 min-[400px]:w-20 sm:h-16 sm:w-24"
          >
            <Image src={src} alt="" fill className="object-cover" sizes="96px" unoptimized={src.endsWith(".svg")} />
          </div>
        ))}
      </div>
      <div className="relative z-10 mx-auto max-w-2xl px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-8 sm:pt-10">
        <div
          className="animate-line-grow mx-auto mb-5 h-px w-16 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
          style={{ "--reveal-delay": "400ms" } as CSSProperties}
        />
        <p className="text-pretty text-sm leading-relaxed text-[var(--fg-muted)]">
          Geselecteerde vintage apparatuur — met echte productfoto&apos;s uit{" "}
          <code className="break-all rounded bg-white/60 px-1.5 py-0.5 text-[0.8125rem] text-[var(--fg)] min-[400px]:break-normal sm:text-sm">
            public/products
          </code>
          . Na aankoop vindt u facturen en geschiedenis in uw account.
        </p>
        <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--fg-soft)] min-[400px]:text-xs min-[400px]:tracking-[0.25em]">
          <Link
            href="/#collectie"
            className="inline-flex min-h-10 items-center justify-center text-[var(--accent)] underline decoration-[var(--accent-dim)] underline-offset-4 transition-colors hover:text-[var(--fg)]"
          >
            Naar de collectie
          </Link>
        </p>
      </div>
    </footer>
  );
}
