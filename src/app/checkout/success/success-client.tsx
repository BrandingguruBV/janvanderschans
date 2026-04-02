"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/money";

type LookupOrder = {
  id: string;
  totalCents: number;
  currency: string;
  email: string;
  stripeInvoiceUrl: string | null;
  stripeInvoicePdfUrl: string | null;
  items: { name: string; quantity: number; priceCents: number; slug: string }[];
};

export function CheckoutSuccessClient({ sessionId }: { sessionId: string }) {
  const { clear } = useCart();
  const [pending, setPending] = useState(true);
  const [order, setOrder] = useState<LookupOrder | null>(null);

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const poll = async () => {
      const res = await fetch(`/api/orders/lookup?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (cancelled) return;
      if (data.pending) {
        tries += 1;
        if (tries < 15) setTimeout(poll, 1000);
        else setPending(false);
        return;
      }
      setPending(false);
      setOrder(data.order);
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (pending && !order) {
    return <p className="text-[#5c4a3a]">Bestelling en factuur bevestigen…</p>;
  }

  if (!order) {
    return (
      <p className="text-[#5c4a3a]">
        Uw betaling is gelukt. De bestelling verschijnt zo in uw account. Stripe stuurt ook een bevestiging per e-mail.
      </p>
    );
  }

  return (
    <div className="space-y-4 text-left">
      <p className="text-[#5c4a3a]">
        Totaal <strong className="text-[#2c1810]">{formatMoney(order.totalCents, order.currency)}</strong> — bevestigd
        naar <strong>{order.email}</strong>.
      </p>
      <ul className="rounded border border-[#d4c4a8] bg-[#faf7f2] p-4 text-sm">
        {order.items.map((i, idx) => (
          <li key={`${i.slug}-${idx}`} className="flex justify-between gap-2 py-1">
            <span>
              {i.quantity}× {i.name}
            </span>
            <span>{formatMoney(i.priceCents * i.quantity, order.currency)}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        {order.stripeInvoiceUrl ? (
          <a
            href={order.stripeInvoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-[#3d2e24] px-4 py-2 text-sm font-medium text-[#faf7f2] hover:bg-[#2c1810]"
          >
            Stripe-factuur openen
          </a>
        ) : null}
        {order.stripeInvoicePdfUrl ? (
          <a
            href={order.stripeInvoicePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-[#8a7a68] px-4 py-2 text-sm hover:bg-[#ebe3d6]"
          >
            PDF downloaden
          </a>
        ) : null}
        <Link href="/account" className="rounded-md border border-[#8a7a68] px-4 py-2 text-sm hover:bg-[#ebe3d6]">
          Account &amp; facturen
        </Link>
      </div>
    </div>
  );
}
