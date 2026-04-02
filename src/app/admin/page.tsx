import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const card =
  "rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [paidSum, count, recent] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "paid" },
      _sum: { totalCents: true },
    }),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: { take: 3 } },
    }),
  ]);

  const revenue = paidSum._sum.totalCents ?? 0;

  return (
    <div className="stagger-child-delays space-y-8">
      <h1 className="animate-reveal-up font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--fg)]">
        Financiën
      </h1>
      <div className="animate-reveal-up grid gap-4 sm:grid-cols-2">
        <div className={card}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--fg-soft)]">Totale omzet (betaalde orders)</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--fg)]">{formatMoney(revenue, "eur")}</p>
        </div>
        <div className={card}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--fg-soft)]">Betaalde bestellingen</p>
          <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--fg)]">{count}</p>
        </div>
      </div>

      <section className="animate-reveal-up">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--fg)]">Recente aankopen</h2>
        <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-soft)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg)] backdrop-blur-sm">
              <tr>
                <th className="p-3 font-semibold">Datum</th>
                <th className="p-3 font-semibold">E-mail</th>
                <th className="p-3 font-semibold">Totaal</th>
                <th className="p-3 font-semibold">Regels</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-t border-[var(--border)] bg-[var(--bg-card)]/50">
                  <td className="p-3 text-[var(--fg-muted)]">{o.createdAt.toLocaleString("nl-NL")}</td>
                  <td className="p-3 text-[var(--fg)]">{o.email}</td>
                  <td className="p-3 font-medium text-[var(--fg)]">{formatMoney(o.totalCents, o.currency)}</td>
                  <td className="p-3 text-[var(--fg-muted)]">
                    {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
