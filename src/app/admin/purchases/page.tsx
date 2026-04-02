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
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Alle aankopen</h1>
      <div className="overflow-x-auto rounded-lg border border-[#d4c4a8]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-[#ebe3d6] text-[#3d2e24]">
            <tr>
              <th className="p-3 font-medium">Datum</th>
              <th className="p-3 font-medium">E-mail klant</th>
              <th className="p-3 font-medium">Account</th>
              <th className="p-3 font-medium">Totaal</th>
              <th className="p-3 font-medium">Factuur</th>
              <th className="p-3 font-medium">Regels</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-[#d4c4a8]">
                <td className="p-3 whitespace-nowrap text-[#5c4a3a]">{o.createdAt.toLocaleString("nl-NL")}</td>
                <td className="p-3">{o.email}</td>
                <td className="p-3 text-[#5c4a3a]">{o.user?.email ?? "Gast"}</td>
                <td className="p-3 font-medium">{formatMoney(o.totalCents, o.currency)}</td>
                <td className="p-3">
                  {o.stripeInvoiceUrl ? (
                    <a
                      href={o.stripeInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3d2e24] underline"
                    >
                      Openen
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3 max-w-xs text-[#5c4a3a]">
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
      <p className="text-sm text-[#5c4a3a]">
        Voor <strong>Google Analytics</strong>, <strong>Search Console</strong> en <strong>Microsoft Clarity</strong>: ga
        naar{" "}
        <Link href="/admin/integrations" className="font-medium text-[#3d2e24] underline">
          Koppelingen
        </Link>
        . Voeg Clarity toe als tag in Google Tag Manager.
      </p>
    </div>
  );
}
