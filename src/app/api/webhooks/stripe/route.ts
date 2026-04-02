import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const cs = event.data.object as Stripe.Checkout.Session;
    try {
      await handleCheckoutCompleted(cs.id);
    } catch (err) {
      console.error("checkout.session.completed handler", err);
      return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "line_items.data.price.product", "invoice"],
  });

  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (existing) return;

  const metaUser = session.metadata?.userId?.trim();
  const userId = metaUser ? metaUser : null;

  const email =
    session.customer_details?.email ?? session.customer_email ?? "unknown@checkout.local";

  let invoiceId: string | null = null;
  let invoiceUrl: string | null = null;
  let invoicePdfUrl: string | null = null;

  const inv = session.invoice;
  if (typeof inv === "object" && inv && !("deleted" in inv && inv.deleted)) {
    invoiceId = inv.id;
    invoiceUrl = inv.hosted_invoice_url ?? null;
    invoicePdfUrl = inv.invoice_pdf ?? null;
  } else if (typeof inv === "string") {
    const full = await stripe.invoices.retrieve(inv);
    invoiceId = full.id;
    invoiceUrl = full.hosted_invoice_url ?? null;
    invoicePdfUrl = full.invoice_pdf ?? null;
  }

  let lineItems = session.line_items?.data ?? [];
  if (lineItems.length === 0) {
    const listed = await stripe.checkout.sessions.listLineItems(sessionId, {
      limit: 100,
      expand: ["data.price.product"],
    });
    lineItems = listed.data;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const totalCents = session.amount_total ?? 0;
  const currency = session.currency ?? "eur";

  const order = await prisma.order.create({
    data: {
      userId,
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      stripeInvoiceId: invoiceId,
      stripeInvoiceUrl: invoiceUrl,
      stripeInvoicePdfUrl: invoicePdfUrl,
      status: "paid",
      totalCents,
      currency,
      email,
      items: {
        create: lineItems.map((li) => {
          const productRef = li.price?.product;
          const productObj =
            typeof productRef === "object" && productRef && !("deleted" in productRef && productRef.deleted)
              ? productRef
              : null;
          const productId = productObj?.metadata?.productId;
          if (!productId) {
            throw new Error("Missing productId on Stripe line item");
          }
          const name = ("name" in (productObj ?? {}) && productObj?.name) ? String(productObj.name) : "Item";
          const unitCents =
            li.price && typeof li.price === "object" && "unit_amount" in li.price && li.price.unit_amount != null
              ? li.price.unit_amount
              : Math.round((li.amount_subtotal ?? 0) / Math.max(li.quantity ?? 1, 1));
          return {
            productId,
            quantity: li.quantity ?? 1,
            priceCents: unitCents,
            name,
          };
        }),
      },
    },
    include: { items: true },
  });

  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stockCount: { decrement: item.quantity },
      },
    });
    const p = await prisma.product.findUnique({ where: { id: item.productId } });
    if (p && p.stockCount <= 0) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { inStock: false, stockCount: 0 },
      });
    }
  }
}
