"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

type Category = { slug: string; name: string };

type Props = {
  categories: Category[];
  brands: string[];
  conditions: string[];
};

const fieldClass =
  "w-full rounded-lg border border-[var(--border-strong)] bg-white/80 px-3 py-2.5 text-[var(--fg)] shadow-sm transition-shadow focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dim)]";

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
    <div className="stagger-children min-w-0 space-y-5 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-4 text-sm text-[var(--fg-muted)] shadow-[var(--shadow-soft)] backdrop-blur-md min-[400px]:p-5">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--fg)]">
          Filters
        </h2>
        {pending ? (
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">Bijwerken…</span>
        ) : null}
      </div>

      <div>
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fg-soft)]">
          Zoeken
        </span>
        <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-stretch">
          <input
            type="search"
            value={qDraft}
            name="q"
            className={`${fieldClass} min-h-10 min-w-0 flex-1`}
            placeholder="Model, merk…"
            onChange={(e) => setQDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") push({ q: qDraft.trim() || null });
            }}
          />
          <button
            type="button"
            className="min-h-10 w-full shrink-0 rounded-lg bg-gradient-to-br from-[var(--fg)] to-[#2a2622] px-4 py-2.5 text-sm font-medium text-[#faf8f5] shadow-md transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] min-[420px]:w-auto min-[420px]:self-center"
            onClick={() => push({ q: qDraft.trim() || null })}
          >
            Zoek
          </button>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fg-soft)]">
          Categorie (map)
        </span>
        <select className={fieldClass} value={current.category} onChange={(e) => push({ category: e.target.value || null })}>
          <option value="">Alle categorieën</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fg-soft)]">Merk</span>
        <select className={fieldClass} value={current.brand} onChange={(e) => push({ brand: e.target.value || null })}>
          <option value="">Alle merken</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fg-soft)]">
          Conditie
        </span>
        <select
          className={fieldClass}
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

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fg-soft)]">
            Min. €
          </span>
          <input
            type="number"
            min={0}
            step={1}
            className={fieldClass}
            defaultValue={current.min}
            onChange={(e) => push({ min: e.target.value || null })}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fg-soft)]">
            Max. €
          </span>
          <input
            type="number"
            min={0}
            step={1}
            className={fieldClass}
            defaultValue={current.max}
            onChange={(e) => push({ max: e.target.value || null })}
          />
        </label>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] bg-white/40 px-3 py-2.5 transition-colors hover:bg-white/70">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-[var(--border-strong)] text-[var(--accent)]"
          checked={current.stock === "1"}
          onChange={(e) => push({ stock: e.target.checked ? "1" : null })}
        />
        <span className="font-medium text-[var(--fg)]">Alleen op voorraad</span>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--fg-soft)]">
          Sorteren
        </span>
        <select className={fieldClass} value={current.sort} onChange={(e) => push({ sort: e.target.value })}>
          <option value="newest">Nieuwste</option>
          <option value="price-asc">Prijs oplopend</option>
          <option value="price-desc">Prijs aflopend</option>
          <option value="name">Naam A–Z</option>
        </select>
      </label>

      <button
        type="button"
        className="w-full rounded-lg border border-[var(--border-strong)] py-2.5 text-sm font-medium text-[var(--fg-muted)] transition-all hover:border-[var(--accent)] hover:bg-white/60 hover:text-[var(--fg)]"
        onClick={() => router.push("/", { scroll: false })}
      >
        Alles wissen
      </button>
    </div>
  );
}
