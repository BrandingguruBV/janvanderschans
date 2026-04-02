import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { IntegrationsForm } from "@/app/admin/integrations/integrations-form";
import { prisma } from "@/lib/prisma";

export default async function AdminIntegrationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const settings =
    (await prisma.siteSettings.findUnique({ where: { id: "default" } })) ?? {
      googleAnalyticsMeasurementId: null as string | null,
      googleTagManagerContainerId: null as string | null,
      googleSearchConsoleVerification: null as string | null,
    };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Koppelingen</h1>
        <p className="mt-2 text-[#5c4a3a]">
          Waarden worden in de database opgeslagen en op de winkel geladen. Gebruik{" "}
          <strong>Google Tag Manager</strong> om GA4, advertenties en <strong>Microsoft Clarity</strong> te activeren
          (Clarity als aangepaste tag of sjabloon binnen GTM).
        </p>
      </div>

      <IntegrationsForm
        initial={{
          googleTagManagerContainerId: settings.googleTagManagerContainerId ?? "",
          googleAnalyticsMeasurementId: settings.googleAnalyticsMeasurementId ?? "",
          googleSearchConsoleVerification: settings.googleSearchConsoleVerification ?? "",
        }}
      />

      <section className="space-y-3 rounded-lg border border-[#d4c4a8] bg-[#f5f0e8] p-4 text-sm text-[#3d2e24]">
        <h2 className="font-medium">Search Console</h2>
        <p>
          Plak de <strong>inhoud</strong> (content) van de Google HTML-verificatietag — niet de hele tag. Deze wordt via
          Next.js-metadata aan Google aangeboden.
        </p>
        <h2 className="pt-2 font-medium">Analytics &amp; Tag Manager</h2>
        <p>
          Als <strong>GTM</strong> is ingevuld, laadt die sitebreed; GA4 voegt u meestal binnen GTM toe. Alleen{" "}
          <strong>GA4-meet-ID</strong> zonder GTM laadt gtag rechtstreeks.
        </p>
        <h2 className="pt-2 font-medium">Microsoft Clarity</h2>
        <p>
          Maak een Clarity-project en voeg in GTM een nieuwe tag toe (project-ID), publiceer de container — geen apart
          veld nodig hier als u GTM gebruikt.
        </p>
      </section>
    </div>
  );
}
