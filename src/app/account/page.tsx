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
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Uw account</h1>
      <p className="text-[#5c4a3a]">
        Ingelogd als <strong className="text-[#2c1810]">{session.user.email}</strong>
      </p>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl">Bestellingen &amp; facturen</h2>
        {orders.length === 0 ? (
          <p className="text-[#5c4a3a]">Nog geen bestellingen.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="rounded-lg border border-[#d4c4a8] bg-[#faf7f2] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#2c1810]">{formatMoney(o.totalCents, o.currency)}</p>
                    <p className="text-sm text-[#5c4a3a]">
                      {o.createdAt.toLocaleString("nl-NL")} · {o.items.length} regel(s) · {o.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {o.stripeInvoiceUrl ? (
                      <a
                        href={o.stripeInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-[#3d2e24] px-3 py-1.5 text-sm text-[#faf7f2] hover:bg-[#2c1810]"
                      >
                        Factuur bekijken
                      </a>
                    ) : (
                      <span className="text-sm text-[#8a7a68]">Factuur volgt</span>
                    )}
                    {o.stripeInvoicePdfUrl ? (
                      <a
                        href={o.stripeInvoicePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md border border-[#8a7a68] px-3 py-1.5 text-sm hover:bg-[#ebe3d6]"
                      >
                        PDF
                      </a>
                    ) : null}
                  </div>
                </div>
                <ul className="mt-3 border-t border-[#ebe3d6] pt-3 text-sm text-[#5c4a3a]">
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

      <Link href="/" className="text-sm font-medium text-[#3d2e24] underline">
        Verder winkelen
      </Link>
    </div>
  );
}
