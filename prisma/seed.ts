import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { syncProductsFromFilesystem } from "../src/lib/product-catalog-sync";

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
  const hash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Beheerder",
      passwordHash: hash,
      role: "ADMIN",
    },
    update: {},
  });

  const sync = await syncProductsFromFilesystem(prisma);
  console.log(
    "Seed OK — beheerder:",
    adminEmail,
    "/ wachtwoord:",
    adminPassword,
    "| Producten uit public/products:",
    sync.products,
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
