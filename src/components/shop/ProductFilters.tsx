"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

type Category = { slug: string; name: string };

type Props = {
  categories: Category[];
  brands: string[];
  conditions: string[];
};

export function ProductFilters({ categories, brands, conditions }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = useMemo(() => {
    return {
      category: searchParams.get("category") ?? "",
      brand: searchParams.get("brand") ?? "",
      condition: searchParams.get("condition") ?? "",
      q: searchParams.get("q") ?? "",
      min: searchParams.get("min") ?? "",
      max: searchParams.get("max") ?? "",
      stock: searchParams.get("stock") ?? "",
      sort: searchParams.get("sort") ?? "newest",
    };
  }, [searchParams]);

  const [qDraft, setQDraft] = useState(current.q);
  useEffect(() => {
    const id = requestAnimationFrame(() => setQDraft(current.q));
    return () => cancelAnimationFrame(id);
  }, [current.q]);

  const push = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      startTransition(() => {
        router.push(`/?${next.toString()}`, { scroll: false });
      });
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-4 rounded-lg border border-[#d4c4a8] bg-[#f5f0e8] p-4 text-sm text-[#3d2e24]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-lg">Filters</h2>
        {pending ? <span className="text-xs text-[#8a7a68]">Bijwerken…</span> : null}
      </div>

      <div className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#8a7a68]">Zoeken</span>
        <div className="flex gap-2">
          <input
            type="search"
            value={qDraft}
            name="q"
            className="min-w-0 flex-1 rounded border border-[#c9b896] bg-white px-3 py-2"
            placeholder="Model, merk…"
            onChange={(e) => setQDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") push({ q: qDraft.trim() || null });
            }}
          />
          <button
            type="button"
            className="shrink-0 rounded bg-[#3d2e24] px-3 py-2 text-white hover:bg-[#2c1810]"
            onClick={() => push({ q: qDraft.trim() || null })}
          >
            Zoek
          </button>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#8a7a68]">Categorie (map)</span>
        <select
          className="w-full rounded border border-[#c9b896] bg-white px-3 py-2"
          value={current.category}
          onChange={(e) => push({ category: e.target.value || null })}
        >
          <option value="">Alle categorieën</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#8a7a68]">Merk</span>
        <select
          className="w-full rounded border border-[#c9b896] bg-white px-3 py-2"
          value={current.brand}
          onChange={(e) => push({ brand: e.target.value || null })}
        >
          <option value="">Alle merken</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#8a7a68]">Conditie</span>
        <select
          className="w-full rounded border border-[#c9b896] bg-white px-3 py-2"
          value={current.condition}
          onChange={(e) => push({ condition: e.target.value || null })}
        >
          <option value="">Alle</option>
          {conditions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#8a7a68]">Min. €</span>
          <input
            type="number"
            min={0}
            step={1}
            className="w-full rounded border border-[#c9b896] bg-white px-3 py-2"
            defaultValue={current.min}
            onChange={(e) => push({ min: e.target.value || null })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#8a7a68]">Max. €</span>
          <input
            type="number"
            min={0}
            step={1}
            className="w-full rounded border border-[#c9b896] bg-white px-3 py-2"
            defaultValue={current.max}
            onChange={(e) => push({ max: e.target.value || null })}
          />
        </label>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={current.stock === "1"}
          onChange={(e) => push({ stock: e.target.checked ? "1" : null })}
        />
        <span>Alleen op voorraad</span>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#8a7a68]">Sorteren</span>
        <select
          className="w-full rounded border border-[#c9b896] bg-white px-3 py-2"
          value={current.sort}
          onChange={(e) => push({ sort: e.target.value })}
        >
          <option value="newest">Nieuwste</option>
          <option value="price-asc">Prijs oplopend</option>
          <option value="price-desc">Prijs aflopend</option>
          <option value="name">Naam A–Z</option>
        </select>
      </label>

      <button
        type="button"
        className="w-full rounded border border-[#8a7a68] py-2 text-sm hover:bg-[#ebe3d6]"
        onClick={() => router.push("/", { scroll: false })}
      >
        Alles wissen
      </button>
    </div>
  );
}
