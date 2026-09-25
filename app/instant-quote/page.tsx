import type { Metadata } from "next";
import Link from "next/link";

import QuoteMeasure from "../../components/QuoteMeasure";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import Crumbs from "../../components/Crumbs";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.cairnsbincleaning.com.au";

export const metadata: Metadata = {
  title: "Instant Cleaning Quote Cairns | Measure It on the Map",
  description:
    "Measure your driveway, roof, patio or car park on satellite imagery and get a Cairns cleaning price on the spot. No call-back, no waiting on a site visit.",
  alternates: { canonical: "/instant-quote" },
  openGraph: {
    title: "Instant satellite quote — Cairns Bin Cleaning",
    description:
      "Tap the corners of your driveway or roof on the map and the price appears. Cairns and the northern beaches.",
    url: "/instant-quote",
    images: [
      {
        url: "/media/driveway-mid-clean-split-line-edmonton.jpg",
        alt: "Driveway half cleaned, showing the clean line, Edmonton, Cairns",
      },
    ],
  },
};

/* Standalone home for the measure-and-quote tool.
   It also lives on the four area-priced service pages, but it earns its own
   URL: it's the page to point an ad, a QR code on the ute or a "get a price"
   link at, and it's the page someone lands on from a shared quote link. */
export default function InstantQuotePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Cairns Bin Cleaning instant satellite quote",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${siteUrl}/instant-quote`,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${siteUrl}/#business`,
      name: "Cairns Bin Cleaning",
      telephone: "+61434052755",
      taxID: "36 318 413 406",
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Installed to a home screen, the page runs under the status bar
          (statusBarStyle black-translucent), so the header needs to clear the
          notch. In a normal browser tab the inset is 0 and this does nothing. */}
      <main className="service-page" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <SiteHeader cta={null} />
        <Crumbs trail={[["Instant quote", "/instant-quote"]]} />

        <QuoteMeasure
          defaultService="driveway"
          asPageTitle
          heading="Measure it yourself. Get the price now."
          intro="Find your place on the satellite map, tap the corners of the driveway, roof, patio or car park, and the price appears as you draw. Accept it and we'll text you to lock in the day."
        />

        <SiteFooter />
      </main>
    </>
  );
}
