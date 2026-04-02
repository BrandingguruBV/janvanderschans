import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="stagger-child-delays space-y-8">
      <h1 className="animate-reveal-up font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--fg)] md:text-4xl">
        Uw account
      </h1>
      <p className="animate-reveal-up text-[var(--fg-muted)]">
        Ingelogd als <strong className="font-semibold text-[var(--fg)]">{session.user.email}</strong>
      </p>

      <section className="animate-reveal-up space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--fg)]">Bestellingen &amp; facturen</h2>
        {orders.length === 0 ? (
          <p className="text-[var(--fg-muted)]">Nog geen bestellingen.</p>
        ) : (
          <ul className="stagger-children space-y-4">
            {orders.map((o) => (
              <li
                key={o.id}
                className="card-premium rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--fg)]">{formatMoney(o.totalCents, o.currency)}</p>
                    <p className="mt-1 text-sm text-[var(--fg-muted)]">
                      {o.createdAt.toLocaleString("nl-NL")} · {o.items.length} regel(s) · {o.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {o.stripeInvoiceUrl ? (
                      <a
                        href={o.stripeInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-gradient-to-r from-[var(--fg)] to-[#2c2824] px-4 py-1.5 text-sm font-medium text-[#faf8f5] shadow-md transition-transform hover:scale-[1.02]"
                      >
                        Factuur bekijken
                      </a>
                    ) : (
                      <span className="text-sm text-[var(--fg-soft)]">Factuur volgt</span>
                    )}
                    {o.stripeInvoicePdfUrl ? (
                      <a
                        href={o.stripeInvoicePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4 py-1.5 text-sm font-medium text-[var(--fg)] backdrop-blur-sm transition-colors hover:border-[var(--accent)]"
                      >
                        PDF
                      </a>
                    ) : null}
                  </div>
                </div>
                <ul className="mt-4 border-t border-[var(--border)] pt-4 text-sm text-[var(--fg-muted)]">
                  {o.items.map((i) => (
                    <li key={i.id}>
                      {i.quantity}× {i.name}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/"
        className="animate-reveal-up inline-block text-sm font-semibold text-[var(--accent)] underline decoration-[var(--accent-dim)] underline-offset-4 transition-colors hover:text-[var(--fg)]"
      >
        Verder winkelen
      </Link>
    </div>
  );
}
