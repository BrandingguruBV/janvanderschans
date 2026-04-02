import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { syncProductsFromFilesystem } from "../src/lib/product-catalog-sync";

const prisma = new PrismaClient();

async function main() {
  const result = await syncProductsFromFilesystem(prisma);
  console.log(
    `Productsync: ${result.products} producten in ${result.categories} categorieën (mappen onder public/products).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
