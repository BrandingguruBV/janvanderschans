"use client";

import Image from "next/image";
import { ScrollParallax } from "@/components/motion/ScrollParallax";

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
};

export function ProductImageParallax({ src, alt, priority }: Props) {
  const unopt = src.endsWith(".svg");
  return (
    <ScrollParallax strength={0.11} className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-gradient-to-br from-[#e8e2d8] to-[#cfc6b8] shadow-[var(--shadow-soft)]">
      <div className="relative h-full w-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          unoptimized={unopt}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
      </div>
    </ScrollParallax>
  );
}
