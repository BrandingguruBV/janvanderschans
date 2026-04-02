import fs from "fs";
import path from "path";
import { cache } from "react";

const VISUAL_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);

function walkProductFiles(absDir: string, acc: string[]) {
  if (!fs.existsSync(absDir)) return;
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(absDir, e.name);
    if (e.isDirectory()) {
      if (!e.name.startsWith(".")) walkProductFiles(full, acc);
      continue;
    }
    const ext = path.extname(e.name).toLowerCase();
    if (!VISUAL_EXT.has(ext) || e.name.startsWith(".")) continue;
    const publicRoot = path.join(process.cwd(), "public");
    const rel = path.relative(publicRoot, full).split(path.sep).join("/");
    acc.push(`/${rel}`);
  }
}

/**
 * All image paths under public/products (the catalog asset tree).
 * Used for hero, ribbons, and ambient chrome so the site reflects real inventory photos.
 */
export const getShopVisualPaths = cache(function getShopVisualPaths(max = 24): string[] {
  const root = path.join(process.cwd(), "public", "products");
  const acc: string[] = [];
  walkProductFiles(root, acc);
  const unique = [...new Set(acc)].filter((p) => !p.toLowerCase().includes("placeholder"));
  unique.sort((a, b) => a.localeCompare(b, "nl"));
  if (unique.length === 0) return ["/products/placeholder.svg"];
  return unique.slice(0, max);
});

export function pickHeroFrames(paths: string[], count = 5): string[] {
  if (paths.length === 0) return ["/products/placeholder.svg"];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(paths[i % paths.length]);
  }
  return out;
}

export function marqueeSequence(paths: string[], minLength = 10): string[] {
  if (paths.length === 0) return ["/products/placeholder.svg"];
  const seq: string[] = [];
  let i = 0;
  while (seq.length < minLength) {
    seq.push(paths[i % paths.length]);
    i += 1;
  }
  return seq;
}
