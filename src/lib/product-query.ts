import type { Prisma } from "@prisma/client";

export function parseShopParams(
  raw: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  ) as Record<string, string | undefined>;
}

export function buildProductWhere(sp: Record<string, string | undefined>): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (sp.category) where.category = { slug: sp.category };
  if (sp.brand) where.brand = sp.brand;
  if (sp.condition) where.condition = sp.condition;
  if (sp.stock === "1") where.inStock = true;

  const min = sp.min ? Math.round(parseFloat(sp.min) * 100) : null;
  const max = sp.max ? Math.round(parseFloat(sp.max) * 100) : null;
  const price: Prisma.IntFilter = {};
  if (min != null && !Number.isNaN(min)) price.gte = min;
  if (max != null && !Number.isNaN(max)) price.lte = max;
  if (Object.keys(price).length) where.priceCents = price;

  const q = sp.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { brand: { contains: q } },
    ];
  }

  return where;
}

export function buildProductOrderBy(
  sort: string | undefined,
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { priceCents: "asc" };
    case "price-desc":
      return { priceCents: "desc" };
    case "name":
      return { name: "asc" };
    default:
      return { createdAt: "desc" };
  }
}
