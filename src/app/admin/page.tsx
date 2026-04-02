import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

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
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Financiën</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[#d4c4a8] bg-[#faf7f2] p-6">
          <p className="text-sm uppercase tracking-wide text-[#8a7a68]">Totale omzet (betaalde orders)</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[#2c1810]">{formatMoney(revenue, "eur")}</p>
        </div>
        <div className="rounded-lg border border-[#d4c4a8] bg-[#faf7f2] p-6">
          <p className="text-sm uppercase tracking-wide text-[#8a7a68]">Betaalde bestellingen</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[#2c1810]">{count}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl">Recente aankopen</h2>
        <div className="overflow-x-auto rounded-lg border border-[#d4c4a8]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#ebe3d6] text-[#3d2e24]">
              <tr>
                <th className="p-3 font-medium">Datum</th>
                <th className="p-3 font-medium">E-mail</th>
                <th className="p-3 font-medium">Totaal</th>
                <th className="p-3 font-medium">Regels</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-t border-[#d4c4a8]">
                  <td className="p-3 text-[#5c4a3a]">{o.createdAt.toLocaleString("nl-NL")}</td>
                  <td className="p-3">{o.email}</td>
                  <td className="p-3 font-medium">{formatMoney(o.totalCents, o.currency)}</td>
                  <td className="p-3 text-[#5c4a3a]">
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
