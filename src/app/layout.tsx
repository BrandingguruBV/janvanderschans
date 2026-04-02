import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { AnalyticsScripts } from "@/components/Analytics";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/Providers";
import { CartProvider } from "@/context/CartContext";
import { getSiteSettings } from "@/lib/site-settings";

/** Voorkomt Prisma tijdens `next build` waar geen database beschikbaar is. */
export const dynamic = "force-dynamic";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: "Jan van der Schans — Vintage camera's",
      template: "%s · Jan van der Schans",
    },
    description:
      "Vintage fotocamera's, lenzen en accessoires — geselecteerd en zorgvuldig beschreven. Betaling en factuur via Stripe.",
    verification: settings.googleSearchConsoleVerification
      ? { google: settings.googleSearchConsoleVerification }
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const gtm = settings.googleTagManagerContainerId?.trim();

  return (
    <html lang="nl" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-[#faf7f2] font-sans text-[#2c1810] antialiased">
        {gtm ? (
          <noscript>
            <iframe
              title="Google Tag Manager"
              src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
        <AnalyticsScripts
          googleTagManagerContainerId={settings.googleTagManagerContainerId}
          googleAnalyticsMeasurementId={settings.googleAnalyticsMeasurementId}
        />
        <Providers>
          <CartProvider>
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
            <Footer />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
