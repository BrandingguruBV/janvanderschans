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

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const src = product.imagePath ?? "/products/placeholder.svg";
  const previewFeatures = product.features.slice(0, 3);
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-[#d4c4a8] bg-[#faf7f2] shadow-sm transition hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/3] bg-[#ebe3d6]">
        <Image
          src={src}
          alt={`${product.name} — productfoto`}
          fill
          unoptimized={src.endsWith(".svg")}
          className="object-cover transition group-hover:opacity-95"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-[#8a7a68]">{product.category.name}</p>
        <Link
          href={`/products/${product.slug}`}
          className="font-[family-name:var(--font-display)] text-lg text-[#2c1810] hover:underline"
        >
          {product.name}
        </Link>
        <p className="text-sm text-[#5c4a3a]">
          {[product.brand, product.condition].filter(Boolean).join(" · ")}
        </p>
        {previewFeatures.length > 0 ? (
          <ul className="mt-1 list-inside list-disc text-xs text-[#5c4a3a]">
            {previewFeatures.map((f, i) => (
              <li key={i} className="line-clamp-2">
                {f}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-auto pt-2 font-medium text-[#2c1810]">{formatMoney(product.priceCents, product.currency)}</p>
      </div>
    </article>
  );
}
