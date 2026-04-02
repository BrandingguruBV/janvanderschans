import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige winkelwagen" }, { status: 400 });
  }

  const authSession = await getServerSession(authOptions);
  const stripe = getStripe();

  const resolved: {
    product: {
      id: string;
      name: string;
      priceCents: number;
      currency: string;
      category: { name: string };
      brand: string | null;
    };
    quantity: number;
  }[] = [];

  for (const line of parsed.data.items) {
    const product = await prisma.product.findUnique({
      where: { id: line.productId },
      include: { category: true },
    });
    if (!product || !product.inStock || product.stockCount < line.quantity) {
      return NextResponse.json(
        { error: `Niet beschikbaar: ${product?.name ?? line.productId}` },
        { status: 400 },
      );
    }
    resolved.push({ product, quantity: line.quantity });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  let stripeCustomerId: string | undefined;
  if (authSession?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: authSession.user.id } });
    if (user?.stripeCustomerId) {
      stripeCustomerId = user.stripeCustomerId;
    } else if (user?.email) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    locale: "nl",
    mode: "payment",
    customer: stripeCustomerId,
    line_items: resolved.map((l) => ({
      price_data: {
        currency: l.product.currency,
        unit_amount: l.product.priceCents,
        product_data: {
          name: l.product.name,
          description: `${l.product.category.name} · ${l.product.brand ?? "Vintage collectie"}`,
          metadata: { productId: l.product.id },
        },
      },
      quantity: l.quantity,
    })),
    invoice_creation: { enabled: true },
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: [
        "AT",
        "BE",
        "BG",
        "HR",
        "CY",
        "CZ",
        "DK",
        "EE",
        "FI",
        "FR",
        "DE",
        "GR",
        "HU",
        "IE",
        "IT",
        "LV",
        "LT",
        "LU",
        "MT",
        "NL",
        "PL",
        "PT",
        "RO",
        "SK",
        "SI",
        "ES",
        "SE",
        "GB",
        "NO",
        "CH",
        "US",
      ],
    },
    phone_number_collection: { enabled: true },
    metadata: {
      userId: authSession?.user?.id ?? "",
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
  });

  if (!checkoutSession.url) {
    return NextResponse.json({ error: "Afrekenen mislukt" }, { status: 500 });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
