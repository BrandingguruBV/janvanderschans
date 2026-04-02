import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId?.startsWith("cs_")) {
    return NextResponse.json({ error: "Ongeldige sessie" }, { status: 400 });
  }
  const order = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: { items: { include: { product: { select: { slug: true } } } } },
  });
  if (!order) {
    return NextResponse.json({ pending: true });
  }
  return NextResponse.json({
    pending: false,
    order: {
      id: order.id,
      totalCents: order.totalCents,
      currency: order.currency,
      email: order.email,
      stripeInvoiceUrl: order.stripeInvoiceUrl,
      stripeInvoicePdfUrl: order.stripeInvoicePdfUrl,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        priceCents: i.priceCents,
        slug: i.product.slug,
      })),
    },
  });
}
