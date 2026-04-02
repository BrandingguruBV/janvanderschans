"use client";

import { type CSSProperties, useState } from "react";
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

  const inputClass =
    "w-20 rounded-lg border border-[var(--border-strong)] bg-white/90 px-2 py-2 text-center text-[var(--fg)] shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dim)]";

  return (
    <div className="stagger-child-delays flex flex-wrap items-end gap-4 pt-3">
      <label className="animate-reveal-up text-sm" style={{ "--reveal-delay": "0ms" } as CSSProperties}>
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fg-soft)]">
          Aantal
        </span>
        <input
          type="number"
          min={1}
          max={maxQty}
          value={qty}
          disabled={disabled}
          onChange={(e) => setQty(Math.max(1, Math.min(maxQty, parseInt(e.target.value, 10) || 1)))}
          className={inputClass}
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
        className="animate-reveal-up rounded-full bg-gradient-to-r from-[var(--fg)] via-[#2c2824] to-[var(--fg)] px-8 py-3 text-sm font-semibold tracking-wide text-[#faf8f5] shadow-lg transition-all duration-500 hover:scale-[1.03] hover:shadow-xl hover:shadow-[var(--accent-dim)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
        style={{ "--reveal-delay": "0.08s" } as CSSProperties}
      >
        In winkelwagen
      </button>
      {msg ? (
        <span className="animate-reveal-fade text-sm font-medium text-emerald-800" style={{ "--reveal-delay": "0ms" } as CSSProperties}>
          {msg}
        </span>
      ) : null}
    </div>
  );
}
