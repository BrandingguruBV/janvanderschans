import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

export type ProductCardProduct = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  imagePath: string | null;
  condition: string | null;
  brand: string | null;
  features: string[];
  category: { name: string; slug: string };
};

export function ProductCard({
  product,
  staggerIndex = 0,
}: {
  product: ProductCardProduct;
  staggerIndex?: number;
}) {
  const src = product.imagePath ?? "/products/placeholder.svg";
  const previewFeatures = product.features.slice(0, 3);
  const delayMs = Math.min(staggerIndex, 36) * 52 + 80;

  return (
    <article
      className="card-premium group flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-soft)] backdrop-blur-sm animate-reveal-up"
      style={{ "--reveal-delay": `${delayMs}ms` } as CSSProperties}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#e8e2d8] to-[#d4cdc2]"
      >
        <Image
          src={src}
          alt={`${product.name} — productfoto`}
          fill
          unoptimized={src.endsWith(".svg")}
          className="card-premium-img object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--fg)]/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">{product.category.name}</p>
        <Link
          href={`/products/${product.slug}`}
          className="break-words font-[family-name:var(--font-display)] text-lg font-semibold leading-snug tracking-tight text-[var(--fg)] transition-colors hover:text-[var(--accent)] md:text-xl"
        >
          {product.name}
        </Link>
        <p className="text-sm text-[var(--fg-muted)]">
          {[product.brand, product.condition].filter(Boolean).join(" · ")}
        </p>
        {previewFeatures.length > 0 ? (
          <ul className="mt-1 space-y-0.5 border-l-2 border-[var(--accent-dim)] pl-3 text-xs leading-snug text-[var(--fg-soft)]">
            {previewFeatures.map((f, i) => (
              <li key={i} className="line-clamp-2">
                {f}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-auto pt-3 font-semibold tracking-wide text-[var(--fg)]">{formatMoney(product.priceCents, product.currency)}</p>
      </div>
    </article>
  );
}
