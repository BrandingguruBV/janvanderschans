"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/money";

type Row = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  imagePath: string | null;
  stockCount: number;
};

const inputQty =
  "w-16 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-2 py-1.5 text-center text-sm text-[var(--fg)] shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dim)]";

export default function CartPage() {
  const { lines, setQty, remove, clear } = useCart();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (lines.length === 0) {
      setRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/cart/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { products: Row[] };
      if (!cancelled) setRows(data.products);
    })();
    return () => {
      cancelled = true;
    };
  }, [lines]);

  const total = rows.reduce((s, r) => {
    const line = lines.find((l) => l.productId === r.id);
    return s + (line ? r.priceCents * line.quantity : 0);
  }, 0);
  const currency = rows[0]?.currency ?? "eur";

  async function checkout() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Afrekenen mislukt");
        return;
      }
      if (data.url) {
        router.push(data.url);
      }
    } catch {
      setErr("Netwerkfout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stagger-child-delays min-w-0 space-y-8">
      <h1 className="animate-reveal-up text-pretty font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw+0.5rem,2.25rem)] font-semibold tracking-tight text-[var(--fg)] md:text-4xl">
        Winkelwagen
      </h1>
      {lines.length === 0 ? (
        <p className="animate-reveal-up text-[var(--fg-muted)]">
          Uw winkelwagen is leeg.{" "}
          <Link href="/" className="font-semibold text-[var(--accent)] underline decoration-[var(--accent-dim)] underline-offset-4 transition-colors hover:text-[var(--fg)]">
            Naar de winkel
          </Link>
          .
        </p>
      ) : (
        <div className="stagger-child-delays space-y-6">
          <ul className="animate-reveal-up stagger-children divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)] backdrop-blur-sm">
            {lines.map((line) => {
              const r = rows.find((x) => x.id === line.productId);
              const src = r?.imagePath ?? "/products/placeholder.svg";
              return (
                <li
                  key={line.productId}
                  className="card-premium flex flex-col gap-3 p-4 transition-colors hover:bg-white/30 min-[520px]:flex-row min-[520px]:flex-wrap min-[520px]:items-center min-[520px]:gap-4"
                >
                  <Link
                    href={r ? `/products/${r.slug}` : "#"}
                    className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[#e8e2d8] to-[#cfc6b8] ring-1 ring-[var(--border)]"
                  >
                    <Image
                      src={src}
                      alt={r?.name ?? ""}
                      fill
                      className="object-cover"
                      unoptimized={src.endsWith(".svg")}
                    />
                  </Link>
                  <div className="min-w-0 flex-1 self-stretch min-[520px]:self-center">
                    <Link
                      href={r ? `/products/${r.slug}` : "#"}
                      className="break-words font-semibold text-[var(--fg)] transition-colors hover:text-[var(--accent)]"
                    >
                      {r?.name ?? "…"}
                    </Link>
                    {r ? (
                      <p className="mt-0.5 text-sm text-[var(--fg-muted)]">
                        {formatMoney(r.priceCents, r.currency)} per stuk · {r.stockCount} op voorraad
                      </p>
                    ) : null}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)] min-[520px]:shrink-0">
                    Aantal
                    <input
                      type="number"
                      min={1}
                      max={r?.stockCount ?? 99}
                      value={line.quantity}
                      onChange={(e) =>
                        setQty(line.productId, Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      className={inputQty}
                    />
                  </label>
                  <button
                    type="button"
                    className="min-h-10 self-start text-sm font-medium text-red-900/80 underline decoration-red-900/25 underline-offset-4 transition-colors hover:text-red-950 min-[520px]:self-center"
                    onClick={() => remove(line.productId)}
                  >
                    Verwijderen
                  </button>
                </li>
              );
            })}
          </ul>
          {err ? <p className="animate-reveal-up text-sm font-medium text-red-800">{err}</p> : null}
          <div className="animate-reveal-up flex flex-col gap-4 border-t border-[var(--border)] pt-6 min-[560px]:flex-row min-[560px]:flex-wrap min-[560px]:items-center min-[560px]:justify-between">
            <p className="text-base font-medium text-[var(--fg-muted)] min-[400px]:text-lg">
              Geschat totaal{" "}
              <span className="font-[family-name:var(--font-display)] text-xl text-[var(--fg)] min-[400px]:text-2xl">
                {formatMoney(total, currency)}
              </span>
            </p>
            <div className="flex w-full flex-col gap-2 min-[400px]:flex-row min-[400px]:flex-wrap min-[400px]:gap-3 min-[560px]:w-auto">
              <button
                type="button"
                className="min-h-11 w-full rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-5 py-2.5 text-sm font-medium text-[var(--fg)] shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[var(--accent)] hover:shadow-md min-[400px]:w-auto"
                onClick={() => clear()}
              >
                Winkelwagen legen
              </button>
              <button
                type="button"
                disabled={loading || lines.length === 0}
                onClick={checkout}
                className="min-h-11 w-full rounded-full bg-gradient-to-r from-[var(--fg)] via-[#2c2824] to-[var(--fg)] px-7 py-2.5 text-sm font-semibold tracking-wide text-[#faf8f5] shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-[var(--accent-dim)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 min-[400px]:w-auto"
              >
                {loading ? "Bezig met omleiden…" : "Afrekenen met Stripe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
