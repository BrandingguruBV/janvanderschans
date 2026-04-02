"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Props = {
  productId: string;
  disabled: boolean;
  maxQty: number;
};

export function AddToCart({ productId, disabled, maxQty }: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-end gap-3 pt-2">
      <label className="text-sm">
        <span className="mb-1 block text-[#5c4a3a]">Aantal</span>
        <input
          type="number"
          min={1}
          max={maxQty}
          value={qty}
          disabled={disabled}
          onChange={(e) => setQty(Math.max(1, Math.min(maxQty, parseInt(e.target.value, 10) || 1)))}
          className="w-20 rounded border border-[#c9b896] bg-white px-2 py-2"
        />
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          add(productId, qty);
          setMsg("Toegevoegd aan winkelwagen");
          setTimeout(() => setMsg(null), 2000);
        }}
        className="rounded-md bg-[#3d2e24] px-6 py-2.5 font-medium text-[#faf7f2] hover:bg-[#2c1810] disabled:cursor-not-allowed disabled:opacity-50"
      >
        In winkelwagen
      </button>
      {msg ? <span className="text-sm text-green-800">{msg}</span> : null}
    </div>
  );
}
