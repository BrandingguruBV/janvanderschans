"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollParallax } from "@/components/motion/ScrollParallax";

type Props = {
  frameSrcs: string[];
};

function Frame({
  src,
  strength,
  className,
  revealDelay,
}: {
  src: string;
  strength: number;
  className: string;
  revealDelay: string;
}) {
  const unopt = src.endsWith(".svg");
  return (
    <ScrollParallax strength={strength} className={className}>
      <div
        className="animate-reveal-scale relative h-full w-full overflow-hidden rounded-[var(--radius-frame)] border border-white/12 bg-[var(--ink-soft)] shadow-[var(--shadow-float)] ring-1 ring-white/5"
        style={{ "--reveal-delay": revealDelay } as CSSProperties}
      >
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          unoptimized={unopt}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--ink)]/80 via-transparent to-white/[0.07]" />
      </div>
    </ScrollParallax>
  );
}

export function HeroEditorial({ frameSrcs }: Props) {
  const a = frameSrcs[0] ?? "/products/placeholder.svg";
  const b = frameSrcs[1] ?? a;
  const c = frameSrcs[2] ?? a;
  const d = frameSrcs[3] ?? a;

  return (
    <section
      className="editorial-hero relative left-1/2 mb-10 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden rounded-b-[var(--radius-hero)] shadow-[var(--shadow-hero)] sm:mb-14 md:mb-16"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={a}
          alt=""
          fill
          className="scale-110 object-cover opacity-[0.22] blur-3xl"
          sizes="100vw"
          unoptimized={a.endsWith(".svg")}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--ink)] via-[var(--ink)]/92 to-[#1f1c18]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(201,162,39,0.12),transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-[max(1rem,env(safe-area-inset-left))] py-12 pr-[max(1rem,env(safe-area-inset-right))] min-[480px]:gap-10 md:px-6 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-24">
        <div className="stagger-child-delays min-w-0 space-y-5 sm:space-y-7 lg:col-span-5">
          <p
            className="animate-reveal-fade text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brass)] min-[400px]:text-[11px] min-[400px]:tracking-[0.38em]"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            Vintage optiek &amp; mechanica
          </p>
          <h1
            id="hero-heading"
            className="animate-reveal-up max-w-[22ch] font-[family-name:var(--font-display)] text-[clamp(1.625rem,5vw+0.65rem,3.15rem)] font-semibold leading-[1.08] tracking-tight text-[var(--hero-fg)] min-[400px]:max-w-none sm:text-[clamp(1.85rem,4.2vw+0.85rem,3.15rem)]"
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            Camera&apos;s met karakter.{" "}
            <span className="bg-gradient-to-r from-[var(--brass)] to-[var(--brass-bright)] bg-clip-text text-transparent">
              Klaar voor uw volgende shoot.
            </span>
          </h1>
          <p
            className="animate-reveal-blur max-w-md text-[0.9375rem] leading-relaxed text-[var(--hero-muted)] min-[400px]:text-base md:text-lg"
            style={{ "--reveal-delay": "200ms" } as CSSProperties}
          >
            Elke listing toont echte productfoto&apos;s uit onze collectie. Filter op merk en conditie, reken veilig af met
            Stripe en ontvang direct uw factuur.
          </p>
          <div
            className="animate-reveal-up flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap"
            style={{ "--reveal-delay": "280ms" } as CSSProperties}
          >
            <Link
              href="#collectie"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--brass)] to-[var(--brass-bright)] px-6 py-3.5 text-sm font-semibold tracking-wide text-[var(--ink)] shadow-lg shadow-[rgba(201,162,39,0.25)] transition-transform duration-500 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] sm:w-auto sm:min-w-[11rem] sm:px-7"
            >
              Bekijk collectie
            </Link>
            <Link
              href="#waarom"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-center text-sm font-medium text-[var(--hero-fg)] backdrop-blur-sm transition-colors hover:border-[var(--brass)]/40 hover:bg-white/10 active:bg-white/15 sm:w-auto sm:min-w-0"
            >
              Waarom bij ons kopen
            </Link>
          </div>
          <ul
            className="animate-reveal-fade flex flex-col gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--hero-soft)] min-[400px]:flex-row min-[400px]:flex-wrap min-[400px]:gap-x-5 min-[400px]:gap-y-2 min-[400px]:text-xs min-[400px]:tracking-[0.2em]"
            style={{ "--reveal-delay": "360ms" } as CSSProperties}
          >
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--brass)]" aria-hidden />
              Veilig betalen
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--brass)]" aria-hidden />
              Factuur in account
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--brass)]" aria-hidden />
              Duidelijke conditie
            </li>
          </ul>
        </div>

        <div className="relative min-w-0 lg:col-span-7">
          <div className="grid grid-cols-2 gap-2 min-[400px]:gap-3 sm:grid-cols-12 sm:gap-4">
            <div className="col-span-2 aspect-[5/4] min-h-[180px] sm:col-span-7 sm:row-span-2 sm:aspect-auto sm:min-h-[220px] md:min-h-[280px]">
              <Frame src={a} strength={0.1} className="h-full min-h-[inherit]" revealDelay="160ms" />
            </div>
            <div className="col-span-1 min-h-[100px] min-[400px]:min-h-[112px] sm:col-span-5 sm:min-h-[132px] md:min-h-[160px]">
              <Frame src={b} strength={0.18} className="h-full min-h-[inherit]" revealDelay="220ms" />
            </div>
            <div className="col-span-1 min-h-[100px] min-[400px]:min-h-[112px] sm:col-span-5 sm:min-h-[132px] md:min-h-[160px]">
              <Frame src={c} strength={0.14} className="h-full min-h-[inherit]" revealDelay="280ms" />
            </div>
            <div className="col-span-2 min-h-[88px] min-[400px]:min-h-[100px] sm:col-span-12 sm:min-h-[120px] md:min-h-[140px]">
              <Frame src={d} strength={0.08} className="h-full min-h-[inherit]" revealDelay="340ms" />
            </div>
          </div>
          <p className="mt-3 text-right text-[9px] font-medium uppercase leading-snug tracking-[0.18em] text-[var(--hero-soft)] min-[400px]:mt-4 min-[400px]:text-[10px] min-[400px]:tracking-[0.24em]">
            Beeldmateriaal uit <span className="text-[var(--brass)]">public/products</span>
          </p>
        </div>
      </div>
    </section>
  );
}
