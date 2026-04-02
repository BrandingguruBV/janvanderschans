"use client";

import Image from "next/image";

type Props = {
  /** Paths under /public — typically from getShopVisualPaths. */
  imageSrcs: string[];
};

export function ProductMarquee({ imageSrcs }: Props) {
  const base = imageSrcs.length > 0 ? imageSrcs : ["/products/placeholder.svg"];
  const seq = [...base, ...base, ...base].slice(0, Math.max(12, base.length * 3));

  return (
    <div className="marquee-shell relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 border-y border-[var(--border)] bg-[var(--bg-ribbon)] py-4 sm:py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[var(--bg-page)] to-transparent sm:w-12 md:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[var(--bg-page)] to-transparent sm:w-12 md:w-16" />
      <p className="mb-3 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] text-center text-[9px] font-semibold uppercase leading-snug tracking-[0.22em] text-[var(--fg-soft)] min-[400px]:mb-4 min-[400px]:text-[10px] min-[400px]:tracking-[0.3em] sm:text-[11px]">
        Uit de schappen — hetzelfde beeldmateriaal als in de shop
      </p>
      <div className="marquee-viewport overflow-hidden">
        <div className="marquee-track flex w-max gap-2 px-3 min-[400px]:gap-3 min-[400px]:px-4 sm:gap-4">
          {seq.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-[5.25rem] w-[4.5rem] shrink-0 overflow-hidden rounded-md border border-[var(--border-strong)] bg-[var(--bg-card)] shadow-md min-[400px]:h-24 min-[400px]:w-32 sm:h-28 sm:w-40 sm:rounded-[var(--radius-lg)]"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 400px) 72px, 160px"
                unoptimized={src.endsWith(".svg")}
              />
            </div>
          ))}
          {seq.map((src, i) => (
            <div
              key={`clone-${src}-${i}`}
              className="relative h-[5.25rem] w-[4.5rem] shrink-0 overflow-hidden rounded-md border border-[var(--border-strong)] bg-[var(--bg-card)] shadow-md min-[400px]:h-24 min-[400px]:w-32 sm:h-28 sm:w-40 sm:rounded-[var(--radius-lg)]"
              aria-hidden
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 400px) 72px, 160px"
                unoptimized={src.endsWith(".svg")}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
