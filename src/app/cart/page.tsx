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
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Winkelwagen</h1>
      {lines.length === 0 ? (
        <p className="text-[#5c4a3a]">
          Uw winkelwagen is leeg.{" "}
          <Link href="/" className="font-medium text-[#3d2e24] underline">
            Naar de winkel
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-6">
          <ul className="divide-y divide-[#d4c4a8] rounded-lg border border-[#d4c4a8] bg-[#faf7f2]">
            {lines.map((line) => {
              const r = rows.find((x) => x.id === line.productId);
              const src = r?.imagePath ?? "/products/placeholder.svg";
              return (
                <li key={line.productId} className="flex flex-wrap items-center gap-4 p-4">
                  <Link
                    href={r ? `/products/${r.slug}` : "#"}
                    className="relative h-20 w-28 shrink-0 overflow-hidden rounded bg-[#ebe3d6]"
                  >
                    <Image
                      src={src}
                      alt={r?.name ?? ""}
                      fill
                      className="object-cover"
                      unoptimized={src.endsWith(".svg")}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={r ? `/products/${r.slug}` : "#"} className="font-medium text-[#2c1810] hover:underline">
                      {r?.name ?? "…"}
                    </Link>
                    {r ? (
                      <p className="text-sm text-[#5c4a3a]">
                        {formatMoney(r.priceCents, r.currency)} per stuk · {r.stockCount} op voorraad
                      </p>
                    ) : null}
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    Aantal
                    <input
                      type="number"
                      min={1}
                      max={r?.stockCount ?? 99}
                      value={line.quantity}
                      onChange={(e) =>
                        setQty(line.productId, Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      className="w-16 rounded border border-[#c9b896] px-2 py-1"
                    />
                  </label>
                  <button
                    type="button"
                    className="text-sm text-red-800 underline"
                    onClick={() => remove(line.productId)}
                  >
                    Verwijderen
                  </button>
                </li>
              );
            })}
          </ul>
          {err ? <p className="text-sm text-red-800">{err}</p> : null}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#d4c4a8] pt-6">
            <p className="text-lg font-medium">
              Geschat totaal <span className="text-[#2c1810]">{formatMoney(total, currency)}</span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-md border border-[#8a7a68] px-4 py-2 text-sm hover:bg-[#ebe3d6]"
                onClick={() => clear()}
              >
                Winkelwagen legen
              </button>
              <button
                type="button"
                disabled={loading || lines.length === 0}
                onClick={checkout}
                className="rounded-md bg-[#3d2e24] px-6 py-2.5 font-medium text-[#faf7f2] hover:bg-[#2c1810] disabled:opacity-50"
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
