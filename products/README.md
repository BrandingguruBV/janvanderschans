# Productafbeeldingen / product images

**Op GitHub staan de winkelbestanden hier:** [`public/products/`](../public/products/)

Next.js serveert statische bestanden uit `public/`, dus de map heet daar `public/products/` — niet `products/` in de root.

**Lokaal:** je kunt hier (`./products/`) een werkmap houden en synchroniseren met het script:

```bash
npm run push:products
```

of `./scripts/push-products-to-github.sh --source products`

Bestanden die te groot zijn voor GitHub staan in `scripts/skipped-product-uploads.txt` na het draaien van dat script.
