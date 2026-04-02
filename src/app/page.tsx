import type { CSSProperties } from "react";
import { Suspense } from "react";
import { HeroEditorial } from "@/components/shop/HeroEditorial";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { ProductMarquee } from "@/components/shop/ProductMarquee";
import { TrustSignals } from "@/components/shop/TrustSignals";
import { getShopVisualPaths, pickHeroFrames } from "@/lib/shop-visuals";
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

  const visuals = getShopVisualPaths(24);

  const brands = brandRows.map((b) => b.brand).filter((b): b is string => b != null).sort();
  const conditions = conditionRows
    .map((c) => c.condition)
    .filter((c): c is string => c != null)
    .sort();

  const heroFrames = pickHeroFrames(visuals, 5);

  return (
    <div className="space-y-0">
      <HeroEditorial frameSrcs={heroFrames} />

      <div className="space-y-10 min-[400px]:space-y-14 md:space-y-20">
        <ProductMarquee imageSrcs={visuals} />

        <TrustSignals />

        <section
          id="collectie"
          className="scroll-mt-[max(7rem,calc(5.5rem+env(safe-area-inset-top)))] space-y-8 min-[400px]:space-y-10 md:space-y-12"
        >
          <header className="stagger-child-delays space-y-4 border-b border-[var(--border)] pb-8">
            <p
              className="animate-reveal-fade text-xs font-semibold uppercase tracking-[0.35em] text-[var(--accent)]"
              style={{ "--reveal-delay": "60ms" } as CSSProperties}
            >
              Collectie
            </p>
            <h2
              className="animate-reveal-up max-w-2xl text-pretty font-[family-name:var(--font-display)] text-[clamp(1.625rem,4vw+0.65rem,2.25rem)] font-semibold leading-tight tracking-tight text-[var(--fg)] md:text-4xl"
              style={{ "--reveal-delay": "120ms" } as CSSProperties}
            >
              Vind uw volgende camera
            </h2>
            <p
              className="animate-reveal-blur max-w-xl text-pretty text-[0.9375rem] leading-relaxed text-[var(--fg-muted)] min-[400px]:text-base"
              style={{ "--reveal-delay": "200ms" } as CSSProperties}
            >
              Filter op categorie, merk, conditie en prijs. Alle productfoto&apos;s komen uit{" "}
              <code className="break-all rounded-md border border-[var(--border)] bg-white/70 px-1.5 py-0.5 text-[0.8125rem] text-[var(--fg)] min-[400px]:break-normal min-[400px]:px-2 min-[400px]:text-sm">
                public/products
              </code>{" "}
              — dezelfde beelden die u hierboven ziet.
            </p>
          </header>

          <div className="grid gap-8 min-[400px]:gap-10 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
            <aside
              className="animate-slide-left min-w-0 lg:sticky lg:top-[max(2rem,env(safe-area-inset-top))] lg:z-[5] lg:self-start"
              style={{ "--reveal-delay": "240ms" } as CSSProperties}
            >
              <Suspense
                fallback={
                  <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-5 text-sm text-[var(--fg-muted)] backdrop-blur-sm">
                    Filters laden…
                  </div>
                }
              >
                <ProductFilters
                  categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
                  brands={brands}
                  conditions={conditions}
                />
              </Suspense>
            </aside>

            <div
              className="animate-slide-right min-w-0"
              style={{ "--reveal-delay": "300ms" } as CSSProperties}
            >
              {products.length === 0 ? (
                <p className="animate-reveal-scale rounded-[var(--radius-xl)] border border-dashed border-[var(--border-strong)] bg-[var(--bg-card)] p-10 text-center text-[var(--fg-muted)] backdrop-blur-sm">
                  Geen producten gevonden met deze filters. Wis de filters of voeg beelden toe in{" "}
                  <code className="rounded bg-white/70 px-1.5 py-0.5 text-[var(--fg)]">public/products/&lt;categorie&gt;/</code>{" "}
                  en voer <code className="rounded bg-white/70 px-1.5 py-0.5 text-[var(--fg)]">npm run sync:products</code> uit
                  (of deploy opnieuw).
                </p>
              ) : (
                <ul className="grid min-w-0 gap-6 min-[400px]:gap-7 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((p, i) => (
                    <li key={p.id}>
                      <ProductCard product={p} staggerIndex={i} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
