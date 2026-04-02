import { Suspense } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { buildProductOrderBy, buildProductWhere, parseShopParams } from "@/lib/product-query";
import { prisma } from "@/lib/prisma";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = parseShopParams(await searchParams);
  const where = buildProductWhere(sp);
  const orderBy = buildProductOrderBy(sp.sort);

  const [products, categories, brandRows, conditionRows] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
    }),
    prisma.product.findMany({
      where: { condition: { not: null } },
      select: { condition: true },
      distinct: ["condition"],
    }),
  ]);

  const brands = brandRows.map((b) => b.brand).filter((b): b is string => b != null).sort();
  const conditions = conditionRows
    .map((c) => c.condition)
    .filter((c): c is string => c != null)
    .sort();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[#2c1810] md:text-4xl">
          Vintage camera&apos;s &amp; accessoires
        </h1>
        <p className="max-w-2xl text-[#5c4a3a]">
          Producten en categorieën komen uit de mappen onder <code className="rounded bg-[#ebe3d6] px-1">public/products</code>
          . Elke map is een filtercategorie; de titel van uw bestand bepaalt de productnaam en de beschrijvingstekst. Filter
          hieronder op merk, conditie en prijs. Betaling en factuur via Stripe.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Suspense
            fallback={
              <div className="rounded-lg border border-[#d4c4a8] bg-[#f5f0e8] p-4 text-sm">Filters laden…</div>
            }
          >
            <ProductFilters
              categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              brands={brands}
              conditions={conditions}
            />
          </Suspense>
        </aside>

        <section>
          {products.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#c9b896] bg-[#f5f0e8] p-8 text-center text-[#5c4a3a]">
              Geen producten gevonden met deze filters. Wis de filters of voeg afbeeldingen toe in{" "}
              <code className="rounded bg-[#ebe3d6] px-1">public/products/&lt;categorie&gt;/</code> en voer{" "}
              <code className="rounded bg-[#ebe3d6] px-1">npm run sync:products</code> uit (of deploy opnieuw).
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
