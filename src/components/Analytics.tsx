"use client";

import Script from "next/script";

type Props = {
  googleTagManagerContainerId: string | null;
  googleAnalyticsMeasurementId: string | null;
};

/** GTM eerst; GA4 en Microsoft Clarity voegt u toe als tags in GTM (beheer). */
export function AnalyticsScripts({ googleTagManagerContainerId, googleAnalyticsMeasurementId }: Props) {
  const gtm = googleTagManagerContainerId?.trim();
  const ga = googleAnalyticsMeasurementId?.trim();

  return (
    <>
      {gtm ? (
        <Script id="gtm-base" strategy="afterInteractive">{`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtm}');
          `}</Script>
      ) : null}
      {ga && !gtm ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4-config" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga}');
          `}</Script>
        </>
      ) : null}
    </>
  );
}
