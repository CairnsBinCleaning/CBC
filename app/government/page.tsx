import type { Metadata } from "next";
import Link from "next/link";
import { services } from "../../lib/services";

export const metadata: Metadata = {
  title: "Government & Procurement Cleaning Cairns | Cairns Bin Cleaning",
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
          <span>CAIRNS</span>
          <small>BIN CLEANING</small>
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
        <article className="abn-card">
          <span>LIVE VERIFICATION</span>
          <strong>ABN 36 318 413 406</strong>
          <small>
            Active · GST registered · trading as Cairns Bin Cleaning (Siezar
            Dewaal, sole trader)
          </small>
          <a
            href="https://abr.business.gov.au/ABN/View?id=36318413406"
            target="_blank"
            rel="noopener noreferrer"
            className="abn-verify-link"
          >
            <span className="pulse" />
            CHECK IT YOURSELF ON THE ABR →
          </a>
        </article>

        <article>
          <span>$20,000,000 COVER</span>
          <strong>PUBLIC LIABILITY</strong>
          <small>Policy EGU627053BPK · current to 12 Aug 2027</small>
          <a
            href="/documents/cairns-bin-cleaning-public-liability-coc.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="abn-verify-link"
          >
            <span className="pulse" />
            VIEW CERTIFICATE OF CURRENCY →
          </a>
        </article>

        <article>
          <span>CURRENT COVER</span>
          <strong>WORKCOVER</strong>
          <small>Policy WSM250967591 · current to 30 Jun 2027</small>
          <a
            href="/documents/cairns-bin-cleaning-workcover-coc.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="abn-verify-link"
          >
            <span className="pulse" />
            VIEW CERTIFICATE OF CURRENCY →
          </a>
        </article>
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
        <span>CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/strata">Strata</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
      <small className="madeBy">Created by Siezar DeWaal</small></footer>
    </main>
  );
}
