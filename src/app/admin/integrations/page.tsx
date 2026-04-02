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
    <div className="mx-auto max-w-2xl stagger-child-delays space-y-8">
      <div className="animate-reveal-up">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--fg)]">Koppelingen</h1>
        <p className="mt-3 leading-relaxed text-[var(--fg-muted)]">
          Waarden worden in de database opgeslagen en op de winkel geladen. Gebruik{" "}
          <strong className="font-semibold text-[var(--fg)]">Google Tag Manager</strong> om GA4, advertenties en{" "}
          <strong className="font-semibold text-[var(--fg)]">Microsoft Clarity</strong> te activeren (Clarity als aangepaste tag of sjabloon binnen GTM).
        </p>
      </div>

      <div className="animate-reveal-up">
        <IntegrationsForm
          initial={{
            googleTagManagerContainerId: settings.googleTagManagerContainerId ?? "",
            googleAnalyticsMeasurementId: settings.googleAnalyticsMeasurementId ?? "",
            googleSearchConsoleVerification: settings.googleSearchConsoleVerification ?? "",
          }}
        />
      </div>

      <section className="animate-reveal-up space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-5 text-sm leading-relaxed text-[var(--fg-muted)] shadow-[var(--shadow-soft)] backdrop-blur-sm">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--fg)]">Search Console</h2>
        <p>
          Plak de <strong className="text-[var(--fg)]">inhoud</strong> (content) van de Google HTML-verificatietag — niet de hele tag. Deze wordt via Next.js-metadata aan Google aangeboden.
        </p>
        <h2 className="pt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--fg)]">Analytics &amp; Tag Manager</h2>
        <p>
          Als <strong className="text-[var(--fg)]">GTM</strong> is ingevuld, laadt die sitebreed; GA4 voegt u meestal binnen GTM toe. Alleen{" "}
          <strong className="text-[var(--fg)]">GA4-meet-ID</strong> zonder GTM laadt gtag rechtstreeks.
        </p>
        <h2 className="pt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--fg)]">Microsoft Clarity</h2>
        <p>
          Maak een Clarity-project en voeg in GTM een nieuwe tag toe (project-ID), publiceer de container — geen apart veld nodig hier als u GTM gebruikt.
        </p>
      </section>
    </div>
  );
}
