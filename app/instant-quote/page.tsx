import type { Metadata } from "next";
import Link from "next/link";

import QuoteMeasure from "../../components/QuoteMeasure";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.zacsbinandpressurecleaning.com.au";

export const metadata: Metadata = {
  title: "Instant Quote — Measure Your Driveway or Roof | Cairns Bin Cleaning",
  description:
    "Measure your own driveway, roof, patio or car park on satellite imagery and get a Cairns pressure cleaning price on the spot. No call-back, no site visit to get started.",
  alternates: { canonical: "/instant-quote" },
  openGraph: {
    title: "Instant satellite quote — Cairns Bin Cleaning",
    description:
      "Tap the corners of your driveway or roof on the map and the price appears. Cairns and the northern beaches.",
    url: "/instant-quote",
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
        <header className="main-header">
          <Link href="/" className="brand">
            <strong>CAIRNS</strong>
            <span>BIN CLEANING</span>
          </Link>

          <nav>
            <Link href="/">SERVICES</Link>
            <Link href="/prices">PRICES</Link>
            <a href="tel:+61434052755">0434 052 755</a>
            <a href="#instant-quote" className="nav-book-btn">
              START
            </a>
          </nav>
        </header>

        <QuoteMeasure
          defaultService="driveway"
          heading="Measure it yourself. Get the price now."
          intro="Find your place on the satellite map, tap the corners of the driveway, roof, patio or car park, and the price appears as you draw. Accept it and we'll text you to lock in the day."
        />

        <footer className="service-footer">
          <span>CAIRNS BIN CLEANING</span>
          <nav>
            <Link href="/service-areas">Areas</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/about">About</Link>
            <Link href="/prices">Prices</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </footer>
      </main>
    </>
  );
}
