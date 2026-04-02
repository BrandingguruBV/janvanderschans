import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getSiteSettings = cache(async () => {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    row ?? {
      id: "default",
      googleAnalyticsMeasurementId: null as string | null,
      googleTagManagerContainerId: null as string | null,
      googleSearchConsoleVerification: null as string | null,
      updatedAt: new Date(),
    }
  );
});
