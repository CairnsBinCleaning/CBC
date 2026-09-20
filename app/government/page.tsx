import type { Metadata } from "next";
import Link from "next/link";
import { services } from "../../lib/services";
import ComplianceDocs from "../../components/ComplianceDocs";
import WalkthroughForm from "../../components/WalkthroughForm";

export const metadata: Metadata = {
  title: "Government & Procurement Cleaning Cairns | CBC Exterior & Property Maintenance",
  description:
    "Exterior cleaning capability for government, council and procurement panels in Cairns and Far North Queensland — ABN-verified, documented scope, scheduled site work.",
  alternates: { canonical: "/government" },
};

const govServiceSlugs = [
  "commercial-cleaning",
  "pressure-cleaning",
  "window-cleaning",
  "gutter-cleaning",
  "roof-cleaning",
];

export default function Government() {
  const list = services.filter((s) => govServiceSlugs.includes(s.slug));

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
        <p className="eyebrow dark">GOVERNMENT &amp; PROCUREMENT</p>
        <h1>Capability, not chasing paperwork.</h1>
        <p>
          Council and government sites need a contractor who can be
          verified in one click and scoped properly before a figure gets
          quoted. ABN registered, insured, and happy to put it in writing.
        </p>
      </section>

      <section className="document-grid">
        <ComplianceDocs />
      </section>

      <section className="segmentServices">
        <h2>What we can scope for a government site.</h2>
        <div className="areas-service-grid">
          {list.map((s) => (
            <Link key={s.slug} href={`/${s.slug}`}>
              {s.name}
            </Link>
          ))}
        </div>
      </section>

      <WalkthroughForm audience="Government / council" />

      <section className="legalBody">
        <h2>Procurement enquiries</h2>
        <p>
          Send the site details, scope and any panel or procurement
          documentation required, and we’ll come back with a proper quote —
          a site visit first for anything beyond a straightforward job, not
          a number guessed over the phone.
        </p>
        <p>
          Call <a href="tel:+61434052755">0434 052 755</a> or email{" "}
          <a href="mailto:zacsbincleaning@gmail.com">
            zacsbincleaning@gmail.com
          </a>
          .
        </p>
      </section>

      <footer className="legalFooter">
        <span>CBC EXTERIOR &amp; PROPERTY MAINTENANCE · CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/strata">Strata</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
      <small className="madeBy">Created by <a href="/faq#siezar-dewaal">Siezar DeWaal</a></small></footer>
    </main>
  );
}
