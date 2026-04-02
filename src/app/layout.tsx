import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import { AnalyticsScripts } from "@/components/Analytics";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/Providers";
import { CartProvider } from "@/context/CartContext";
import { getSiteSettings } from "@/lib/site-settings";

/** Voorkomt Prisma tijdens `next build` waar geen database beschikbaar is. */
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
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
      <body className="premium-page-bg premium-grain flex min-h-full min-w-0 flex-col antialiased">
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
            <main
              className="animate-reveal-fade relative z-10 mx-auto w-full min-w-0 max-w-6xl flex-1 py-10 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 md:py-14 md:pl-[max(1.5rem,env(safe-area-inset-left))] md:pr-[max(1.5rem,env(safe-area-inset-right))]"
              style={{ "--reveal-delay": "340ms" } as React.CSSProperties}
            >
              {children}
            </main>
            <Footer />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
