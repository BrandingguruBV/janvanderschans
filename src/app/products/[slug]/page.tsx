import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/AddToCart";
import { ProductImageParallax } from "@/components/shop/ProductImageParallax";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product) notFound();

  const src = product.imagePath ?? "/products/placeholder.svg";

  return (
    <article className="grid min-w-0 gap-8 min-[400px]:gap-10 md:grid-cols-2 md:gap-12 lg:gap-14">
      <div className="animate-reveal-blur" style={{ "--reveal-delay": "100ms" } as CSSProperties}>
        <ProductImageParallax src={src} alt={`${product.name} — productfoto`} priority />
      </div>

      <div className="stagger-child-delays flex min-w-0 flex-col space-y-5">
        <p className="animate-reveal-up text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
          <Link href={`/?category=${product.category.slug}`} className="transition-colors hover:text-[var(--fg)]">
            {product.category.name}
          </Link>
        </p>
        <h1 className="animate-reveal-up break-words font-[family-name:var(--font-display)] text-[clamp(1.625rem,4vw+0.5rem,2.25rem)] font-semibold leading-tight tracking-tight text-[var(--fg)] md:text-4xl">
          {product.name}
        </h1>
        <p className="animate-reveal-up text-2xl font-semibold tracking-wide text-[var(--fg)]">
          {formatMoney(product.priceCents, product.currency)}
        </p>
        <dl className="animate-reveal-up grid grid-cols-2 gap-x-4 gap-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-4 text-sm backdrop-blur-sm">
          {product.brand ? (
            <>
              <dt className="font-semibold text-[var(--fg-soft)]">Merk</dt>
              <dd className="text-[var(--fg)]">{product.brand}</dd>
            </>
          ) : null}
          {product.condition ? (
            <>
              <dt className="font-semibold text-[var(--fg-soft)]">Conditie</dt>
              <dd className="text-[var(--fg)]">{product.condition}</dd>
            </>
          ) : null}
          {product.era ? (
            <>
              <dt className="font-semibold text-[var(--fg-soft)]">Periode</dt>
              <dd className="text-[var(--fg)]">{product.era}</dd>
            </>
          ) : null}
          <dt className="font-semibold text-[var(--fg-soft)]">Voorraad</dt>
          <dd className="text-[var(--fg)]">{product.inStock ? `${product.stockCount} beschikbaar` : "Niet op voorraad"}</dd>
        </dl>

        <div className="animate-reveal-up space-y-3 leading-relaxed text-[var(--fg-muted)]">
          {product.description.split("\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {product.features.length > 0 ? (
          <div className="animate-reveal-up rounded-[var(--radius-xl)] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-card)] to-white/40 p-5 backdrop-blur-sm">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--fg)]">Kenmerken</h2>
            <ul className="mt-3 space-y-2 border-l-2 border-[var(--accent-dim)] pl-4 text-sm text-[var(--fg-muted)]">
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="animate-reveal-up">
          <AddToCart
            productId={product.id}
            disabled={!product.inStock || product.stockCount < 1}
            maxQty={product.stockCount}
          />
        </div>
        <p className="animate-reveal-up text-xs leading-relaxed text-[var(--fg-soft)]">
          Afrekenen verloopt veilig via Stripe. Na betaling ontvangt u een factuur voor uw administratie.
        </p>
      </div>
    </article>
  );
}
