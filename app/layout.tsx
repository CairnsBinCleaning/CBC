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

// The Google Ads conversion tag for this account (looks like AW-XXXXXXXXXX,
// found in Google Ads > Tools > Conversions > Google tag). Kept as its own
// env var and its own script block, deliberately separate from the GA4 tag
// above, so this can be installed, rotated or removed without ever touching
// the GA4 tag's settings. Nothing loads until NEXT_PUBLIC_ADS_ID is set.
const adsId = process.env.NEXT_PUBLIC_ADS_ID;

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
  verification: {
    google: "qy0_aHd1bFTi5PQaDgJGn-PNBpn3Uxu4fs8nlzOqJOM",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Cairns Bin Cleaning",
  telephone: "+61434052755",
  url: siteUrl,
  // Character-for-character match with the "Service area" list on the real
  // Google Business Profile listing (checked 2026-09-17, Location tab).
  // Keep this list and the one in app/[slug]/page.tsx in sync with GBP —
  // don't hand-edit one without the other.
  areaServed: [
    "Cairns QLD, Australia",
    "Cairns City QLD, Australia",
    "Bentley Park QLD, Australia",
    "Manoora QLD 4870, Australia",
    "Manunda QLD 4870, Australia",
    "Yorkeys Knob QLD, Australia",
    "Kanimbla QLD 4870, Australia",
    "Machans Beach QLD, Australia",
    "Redlynch QLD 4870, Australia",
    "Trinity Beach QLD, Australia",
    "Brinsmead QLD 4870, Australia",
    "Edge Hill QLD 4870, Australia",
    "Stratford QLD 4870, Australia",
    "Westcourt QLD 4870, Australia",
    "Whitfield QLD 4870, Australia",
    "Freshwater QLD 4870, Australia",
    "Gordonvale QLD 4865, Australia",
    "Mooroobool QLD 4870, Australia",
    "Smithfield QLD 4878, Australia",
    "Parramatta Park QLD 4870, Australia",
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
        {adsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
              strategy="afterInteractive"
            />
            <Script id="ads-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${adsId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
