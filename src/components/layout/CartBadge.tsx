"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function CartBadge() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="rounded-md px-2 py-1 hover:bg-[#ebe3d6]">
      Winkelwagen{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
