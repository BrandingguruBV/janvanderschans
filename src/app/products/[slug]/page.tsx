import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/AddToCart";
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
    <article className="grid gap-10 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-[#d4c4a8] bg-[#ebe3d6]">
        <Image
          src={src}
          alt={`${product.name} — productfoto`}
          fill
          className="object-cover"
          priority
          unoptimized={src.endsWith(".svg")}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-wide text-[#8a7a68]">
          <Link href={`/?category=${product.category.slug}`} className="hover:underline">
            {product.category.name}
          </Link>
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[#2c1810]">{product.name}</h1>
        <p className="text-lg font-medium">{formatMoney(product.priceCents, product.currency)}</p>
        <dl className="grid grid-cols-2 gap-2 text-sm text-[#5c4a3a]">
          {product.brand ? (
            <>
              <dt className="font-medium text-[#3d2e24]">Merk</dt>
              <dd>{product.brand}</dd>
            </>
          ) : null}
          {product.condition ? (
            <>
              <dt className="font-medium text-[#3d2e24]">Conditie</dt>
              <dd>{product.condition}</dd>
            </>
          ) : null}
          {product.era ? (
            <>
              <dt className="font-medium text-[#3d2e24]">Periode</dt>
              <dd>{product.era}</dd>
            </>
          ) : null}
          <dt className="font-medium text-[#3d2e24]">Voorraad</dt>
          <dd>{product.inStock ? `${product.stockCount} beschikbaar` : "Niet op voorraad"}</dd>
        </dl>

        <div className="space-y-3 text-[#3d2e24] leading-relaxed">
          {product.description.split("\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {product.features.length > 0 ? (
          <div className="rounded-lg border border-[#d4c4a8] bg-[#f5f0e8] p-4">
            <h2 className="font-[family-name:var(--font-display)] text-lg text-[#2c1810]">Kenmerken</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[#3d2e24]">
              {product.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <AddToCart
          productId={product.id}
          disabled={!product.inStock || product.stockCount < 1}
          maxQty={product.stockCount}
        />
        <p className="text-xs text-[#8a7a68]">
          Afrekenen verloopt veilig via Stripe. Na betaling ontvangt u een factuur voor uw administratie.
        </p>
      </div>
    </article>
  );
}
