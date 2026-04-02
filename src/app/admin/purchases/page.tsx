import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function AdminPurchasesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: { select: { email: true } } },
  });

  return (
    <div className="stagger-child-delays space-y-6">
      <h1 className="animate-reveal-up font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--fg)]">
        Alle aankopen
      </h1>
      <div className="animate-reveal-up overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-soft)]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg)] backdrop-blur-sm">
            <tr>
              <th className="p-3 font-semibold">Datum</th>
              <th className="p-3 font-semibold">E-mail klant</th>
              <th className="p-3 font-semibold">Account</th>
              <th className="p-3 font-semibold">Totaal</th>
              <th className="p-3 font-semibold">Factuur</th>
              <th className="p-3 font-semibold">Regels</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-[var(--border)] bg-[var(--bg-card)]/50">
                <td className="p-3 whitespace-nowrap text-[var(--fg-muted)]">{o.createdAt.toLocaleString("nl-NL")}</td>
                <td className="p-3 text-[var(--fg)]">{o.email}</td>
                <td className="p-3 text-[var(--fg-muted)]">{o.user?.email ?? "Gast"}</td>
                <td className="p-3 font-medium text-[var(--fg)]">{formatMoney(o.totalCents, o.currency)}</td>
                <td className="p-3">
                  {o.stripeInvoiceUrl ? (
                    <a
                      href={o.stripeInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[var(--accent)] underline decoration-[var(--accent-dim)] underline-offset-2 hover:text-[var(--fg)]"
                    >
                      Openen
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="max-w-xs p-3 text-[var(--fg-muted)]">
                  {o.items.map((i) => (
                    <span key={i.id} className="block truncate">
                      {i.quantity}× {i.name}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="animate-reveal-up text-sm text-[var(--fg-muted)]">
        Voor <strong className="font-semibold text-[var(--fg)]">Google Analytics</strong>, <strong className="font-semibold text-[var(--fg)]">Search Console</strong> en{" "}
        <strong className="font-semibold text-[var(--fg)]">Microsoft Clarity</strong>: ga naar{" "}
        <Link href="/admin/integrations" className="font-semibold text-[var(--accent)] underline decoration-[var(--accent-dim)] underline-offset-4 hover:text-[var(--fg)]">
          Koppelingen
        </Link>
        . Voeg Clarity toe als tag in Google Tag Manager.
      </p>
    </div>
  );
}
