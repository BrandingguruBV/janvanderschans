"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function CartBadge() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      className="nav-link-premium inline-flex min-h-10 items-center justify-center rounded-md px-3 py-2 transition-colors hover:bg-white/50 hover:text-[var(--fg)]"
    >
      Winkelwagen{count > 0 ? <span className="text-[var(--accent)]"> ({count})</span> : null}
    </Link>
  );
}
