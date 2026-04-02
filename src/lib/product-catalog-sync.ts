import { existsSync, readdirSync } from "fs";
import { basename, extname, join } from "path";
import type { PrismaClient } from "@prisma/client";

export const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

const DEFAULT_PRICE_CENTS = 10_000;
const DEFAULT_STOCK = 1;

/** Map van mapnaam (slug) → Nederlandse weergavenaam voor filters en teksten */
export const CATEGORY_LABELS_NL: Record<string, string> = {
  "vintage-cameras": "Vintage camera's",
  "vintage-cameras-en": "Vintage camera's",
  lenzen: "Lenzen",
  lenses: "Lenzen",
  accessoires: "Accessoires",
  accessories: "Accessoires",
  "film-en-opslag": "Film & opslag",
  "film-storage": "Film & opslag",
  "tassen-en-koffers": "Tassen & koffers",
  "bags-cases": "Tassen & koffers",
  overig: "Overig",
};

const KNOWN_BRANDS = new Set([
  "Canon",
  "Nikon",
  "Leica",
  "Pentax",
  "Olympus",
  "Minolta",
  "Sony",
  "Fuji",
  "Fujifilm",
  "Kodak",
  "Polaroid",
  "Hasselblad",
  "Mamiya",
  "Bronica",
  "Rollei",
  "Zeiss",
  "Voigtländer",
  "Voigtlander",
  "Contax",
  "Yashica",
  "Petri",
  "Praktica",
  "Sekonic",
  "Domke",
  "Agfa",
  "Ilford",
]);

export function slugifySegment(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function titleFromImageBasename(base: string): string {
  const cleaned = base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "Product";
  return cleaned
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function categoryDisplayNameNl(folderSlug: string): string {
  if (CATEGORY_LABELS_NL[folderSlug]) return CATEGORY_LABELS_NL[folderSlug];
  return folderSlug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function guessBrandFromTitle(title: string): string | null {
  const first = title.split(/\s+/)[0];
  if (!first) return null;
  const norm = first.replace(/[^a-zA-ZäöüÄÖÜßàèéù]/g, "");
  for (const b of KNOWN_BRANDS) {
    if (b.toLowerCase() === norm.toLowerCase()) return b;
  }
  return null;
}

export function guessEraFromText(text: string): string | null {
  const m = text.match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : null;
}

export function buildDescriptionNl(productTitle: string, categoryLabel: string): string {
  return [
    `Deze aanbieding betreft “${productTitle}”. De naam is afgeleid van de titel van uw productfoto (bestandsnaam). U ontvangt het exemplaar dat op de foto staat, tenzij anders vermeld.`,
    `Categorie: ${categoryLabel}. Wij beschrijven conditie en bijzonderheden zo eerlijk mogelijk. Voor technische details kunt u na aankoop contact opnemen via uw account.`,
    "Betaling en facturatie verlopen via Stripe; u ontvangt na betaling een factuur voor uw administratie.",
  ].join("\n\n");
}

export function buildFeaturesNl(categorySlug: string, productTitle: string): string[] {
  const slug = categorySlug.toLowerCase();
  const isLens = slug.includes("lens") || slug === "lenzen";
  const isFilm = slug.includes("film") || slug.includes("opslag");
  const isBag = slug.includes("tas") || slug.includes("koffer") || slug.includes("bag");

  if (isLens) {
    return [
      `Optiek voor: ${productTitle} (titel uit bestandsnaam)`,
      "Glaselementen en coating visueel beoordeeld",
      "Diafragma en scherpstelmechanisme gecontroleerd waar van toepassing",
      "Lensvatting en koppeling met body beoordeeld",
      "Geschikt voor analoge fotografie — compatibiliteit zelf verifiëren bij twijfel",
      "Verzending met doppen en bescherming waar aanwezig",
    ];
  }

  if (isFilm) {
    return [
      `Product: ${productTitle}`,
      "Koel bewaard waar mogelijk; houd rekening met vervaldata op verpakking",
      "Verpakking kan lichte sporen van opslag vertonen",
      "Verzending in stevige buitenverpakking",
      "Geen retour op geopende film tenzij anders overeengekomen",
      "Factuur via Stripe na betaling",
    ];
  }

  if (isBag) {
    return [
      `Tas of koffer: ${productTitle}`,
      "Ritsen, gespen en schouderband gecontroleerd",
      "Binnenbekleding en vakken beschreven op de productpagina",
      "Materiaal en slijtage eerlijk vermeld",
      "Geschikt om body en lenzen te beschermen tijdens transport",
      "Verzending met vulling ter bescherming van hardware",
    ];
  }

  // Camera's en algemeen
  return [
    `Toestel: ${productTitle} — naam afgeleid van de bestandsnaam van uw foto`,
    "Spiegel, sluiter en lichtmeter gecontroleerd waar van toepassing",
    "Zoeker en scherpstelmechanisme beoordeeld",
    "Lichtmeterbatterij: niet gegarandeerd; vermeld indien meegeleverd",
    "Light seals: controleer bij klassieke body’s; vervanging kan nodig zijn",
    "Verzending verzekerd met track & trace waar mogelijk",
  ];
}

export type SyncResult = { categories: number; products: number };

/**
 * Leest `public/products/<map>/<afbeelding>` en werkt categorieën en producten bij.
 * Bestaande prijs en voorraad blijven behouden zolang het product al bestaat (zelfde slug).
 */
export async function syncProductsFromFilesystem(prisma: PrismaClient): Promise<SyncResult> {
  const root = join(process.cwd(), "public", "products");
  if (!existsSync(root)) {
    return { categories: 0, products: 0 };
  }

  const entries = readdirSync(root, { withFileTypes: true });
  const categoryDirs = entries.filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));

  let products = 0;
  let categoryCount = 0;

  for (let i = 0; i < categoryDirs.length; i++) {
    const dir = categoryDirs[i];
    const categorySlug = slugifySegment(dir.name);
    if (!categorySlug) continue;

    const categoryName = categoryDisplayNameNl(categorySlug);
    const sortOrder = i * 10;

    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      create: {
        slug: categorySlug,
        name: categoryName,
        description: `Collectie: ${categoryName}. Producten volgen de mappenstructuur onder /public/products.`,
        sortOrder,
      },
      update: {
        name: categoryName,
        sortOrder,
      },
    });
    categoryCount += 1;

    const catPath = join(root, dir.name);
    const files = readdirSync(catPath, { withFileTypes: true }).filter((f) => f.isFile());

    for (const file of files) {
      const ext = extname(file.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;

      const base = basename(file.name, ext);
      if (!base || base.startsWith(".")) continue;

      const productSlug = `${categorySlug}-${slugifySegment(base)}`;
      if (!productSlug.replace(/-/g, "")) continue;

      const title = titleFromImageBasename(base);
      const imagePath = `/products/${dir.name.replace(/\\/g, "/")}/${file.name}`;
      const description = buildDescriptionNl(title, categoryName);
      const features = buildFeaturesNl(categorySlug, title);
      const brand = guessBrandFromTitle(title);
      const era = guessEraFromText(`${title} ${base}`);
      const condition = "Gecontroleerd";

      await prisma.product.upsert({
        where: { slug: productSlug },
        create: {
          slug: productSlug,
          name: title,
          description,
          features,
          imagePath,
          brand,
          condition,
          era,
          categoryId: category.id,
          priceCents: DEFAULT_PRICE_CENTS,
          stockCount: DEFAULT_STOCK,
          inStock: true,
          currency: "eur",
        },
        update: {
          name: title,
          description,
          features,
          imagePath,
          brand,
          condition,
          era,
          categoryId: category.id,
        },
      });
      products += 1;
    }
  }

  return { categories: categoryCount, products };
}
