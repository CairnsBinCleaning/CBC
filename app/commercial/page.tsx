import type { Metadata } from "next";
import Link from "next/link";
import ComplianceDocs from "../../components/ComplianceDocs";
import WalkthroughForm from "../../components/WalkthroughForm";
import { commercialPages } from "../../lib/commercial";

export const metadata: Metadata = {
  title: "Commercial Exterior Cleaning Cairns | CBC Exterior & Property Maintenance",
  description:
    "Commercial exterior cleaning in Cairns: car parks, bin rooms and refuse chutes, shopfronts and footpaths, building and roof washes, graffiti removal and commercial kitchens. Insured, scheduled around trading hours.",
  alternates: { canonical: "/commercial" },
};

export default function Commercial() {
  return (
    <main className="legalPage">
      <header className="nav navLight">
        <Link href="/" className="brand">
          <span>CBC</span>
          <small>EXTERIOR &amp; PROPERTY MAINTENANCE</small>
        </Link>
        <nav>
          <Link href="/">Home</Link>
          <a href="tel:+61434052755">0434 052 755</a>
        </nav>
      </header>

      <section className="segmentHero">
        <h1>
          <span className="eyebrow dark" style={{ display: "block", lineHeight: 1.5, marginBottom: 12 }}>
            COMMERCIAL EXTERIOR CLEANING CAIRNS
          </span>
          One contractor for the whole outside of the site.
        </h1>
        <p>
          Car parks, bin rooms, refuse chutes, shopfronts, footpaths, buildings, roofs, windows inside and out,
          graffiti and commercial kitchens. Walked first, priced in writing, scheduled around your trading hours.
        </p>
      </section>

      <section className="segmentServices">
        <h2>What we do for commercial sites.</h2>
        <div className="areas-service-grid">
          {commercialPages.map((p) => (
            <Link key={p.slug} href={`/commercial/${p.slug}`}>
              {p.name}
            </Link>
          ))}
          <Link href="/strata">Strata &amp; body corporate</Link>
          <Link href="/government">Government &amp; council</Link>
          <Link href="/commercial-cleaning">Commercial cleaning overview</Link>
        </div>
      </section>

      <section className="document-grid">
        <ComplianceDocs />
      </section>

      <WalkthroughForm
        audience="Commercial"
        options={["Car park", "Bin room / refuse chute", "Shopfront / footpath", "Building / roof wash", "Graffiti", "Kitchen / exhaust fans", "Windows"]}
      />

      <footer className="legalFooter">
        <span>CBC EXTERIOR &amp; PROPERTY MAINTENANCE · CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/strata">Strata</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <small className="madeBy">
          Created by <a href="/faq#siezar-dewaal">Siezar DeWaal</a>
        </small>
      </footer>
    </main>
  );
}
