import type { Metadata } from "next";
import Script from "next/script";
import SeasonalBanner from "../components/SeasonalBanner";
import "./globals.css";

// TODO: once the new domain is chosen, set NEXT_PUBLIC_SITE_URL in .env.local
// and swap the fallback below. Using the current live legacy domain as a
// placeholder for now since it's the only real domain this business owns.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.zacsbinandpressurecleaning.com.au";

// Set NEXT_PUBLIC_GA_ID in .env.local once you have a real GA4 measurement
// ID (looks like G-XXXXXXXXXX). Nothing loads or tracks until it's set —
// no placeholder ID is baked in here.
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cairns Exterior Cleaning | Cairns Bin Cleaning",
    template: "%s",
  },
  description:
    "Pressure cleaning, bin cleaning, roof cleaning, solar panel cleaning and exterior maintenance across Cairns and FNQ.",
  openGraph: {
    siteName: "Cairns Bin Cleaning",
    locale: "en_AU",
    type: "website",
    images: [{ url: "/media/IMG_3027.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/media/IMG_3027.jpg"],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Cairns Bin Cleaning",
  telephone: "+61434052755",
  url: siteUrl,
  areaServed: [
    "Cairns",
    "Far North Queensland",
    "Northern Beaches Cairns",
    "Gordonvale",
  ],
  taxID: "36 318 413 406",
  description:
    "Bin cleaning, pressure cleaning, roof cleaning, window cleaning, solar panel cleaning and exterior maintenance across Cairns and Far North Queensland.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <SeasonalBanner />
        {children}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
