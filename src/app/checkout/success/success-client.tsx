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
    return <p className="animate-reveal-fade text-[var(--fg-muted)]">Bestelling en factuur bevestigen…</p>;
  }

  if (!order) {
    return (
      <p className="animate-reveal-fade text-[var(--fg-muted)]">
        Uw betaling is gelukt. De bestelling verschijnt zo in uw account. Stripe stuurt ook een bevestiging per e-mail.
      </p>
    );
  }

  return (
    <div className="stagger-children space-y-4 text-left">
      <p className="text-[var(--fg-muted)]">
        Totaal{" "}
        <strong className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--fg)]">
          {formatMoney(order.totalCents, order.currency)}
        </strong>{" "}
        — bevestigd naar <strong className="text-[var(--fg)]">{order.email}</strong>.
      </p>
      <ul className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-4 text-sm shadow-[var(--shadow-soft)] backdrop-blur-sm">
        {order.items.map((i, idx) => (
          <li key={`${i.slug}-${idx}`} className="flex justify-between gap-2 border-b border-[var(--border)] py-2 last:border-0">
            <span className="text-[var(--fg-muted)]">
              {i.quantity}× {i.name}
            </span>
            <span className="font-medium text-[var(--fg)]">{formatMoney(i.priceCents * i.quantity, order.currency)}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
        {order.stripeInvoiceUrl ? (
          <a
            href={order.stripeInvoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gradient-to-r from-[var(--fg)] to-[#2c2824] px-5 py-2 text-sm font-semibold text-[#faf8f5] shadow-md transition-transform hover:scale-[1.02]"
          >
            Stripe-factuur openen
          </a>
        ) : null}
        {order.stripeInvoicePdfUrl ? (
          <a
            href={order.stripeInvoicePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-5 py-2 text-sm font-medium text-[var(--fg)] backdrop-blur-sm transition-colors hover:border-[var(--accent)]"
          >
            PDF downloaden
          </a>
        ) : null}
        <Link
          href="/account"
          className="rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-5 py-2 text-sm font-medium text-[var(--fg)] backdrop-blur-sm transition-colors hover:border-[var(--accent)]"
        >
          Account &amp; facturen
        </Link>
      </div>
    </div>
  );
}
