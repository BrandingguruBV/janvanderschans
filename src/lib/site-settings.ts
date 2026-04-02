import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type SiteSettingsRow = {
  id: string;
  googleAnalyticsMeasurementId: string | null;
  googleTagManagerContainerId: string | null;
  googleSearchConsoleVerification: string | null;
  updatedAt: Date;
};

function defaultSiteSettings(): SiteSettingsRow {
  return {
    id: "default",
    googleAnalyticsMeasurementId: null,
    googleTagManagerContainerId: null,
    googleSearchConsoleVerification: null,
    updatedAt: new Date(),
  };
}

export const getSiteSettings = cache(async (): Promise<SiteSettingsRow> => {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    return row ?? defaultSiteSettings();
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[getSiteSettings] Database unreachable — using empty settings. Check DATABASE_URL and that Postgres is running.",
        e,
      );
    }
    return defaultSiteSettings();
  }
});
