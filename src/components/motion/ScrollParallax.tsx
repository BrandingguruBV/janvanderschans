"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Multiplier for scroll offset (subtle = 0.08–0.2). */
  strength?: number;
  innerClassName?: string;
};

export function ScrollParallax({ children, className, innerClassName, strength = 0.14 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let removeListeners: (() => void) | undefined;

    const frame = requestAnimationFrame(() => {
      if (cancelled) return;
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq.matches) {
        setEnabled(false);
        return;
      }

      const onScroll = () => {
        const el = rootRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const center = rect.top + rect.height / 2;
        const norm = (vh / 2 - center) / vh;
        setY(norm * 80 * strength);
      };

      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      removeListeners = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      removeListeners?.();
    };
  }, [strength]);

  return (
    <div ref={rootRef} className={className}>
      <div
        className={innerClassName}
        style={
          enabled
            ? { transform: `translate3d(0, ${y}px, 0)`, willChange: "transform" }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
