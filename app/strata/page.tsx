import type { Metadata } from "next";
import Link from "next/link";
import { services } from "../../lib/services";

export const metadata: Metadata = {
  title: "Strata & Body Corporate Cleaning Cairns | Cairns Bin Cleaning",
  description:
    "Recurring exterior maintenance for strata and body corporate properties in Cairns — bin cleaning, pressure cleaning, window and gutter cleaning, scheduled around occupancy.",
  alternates: { canonical: "/strata" },
};

const strataServiceSlugs = [
  "bin-cleaning",
  "pressure-cleaning",
  "window-cleaning",
  "gutter-cleaning",
  "commercial-cleaning",
];

export default function Strata() {
  const list = services.filter((s) => strataServiceSlugs.includes(s.slug));

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
        <p className="eyebrow dark">STRATA &amp; BODY CORPORATE</p>
        <h1>Punctual. Predictable. Presentable.</h1>
        <p>
          Common property, refuse rooms, car parks and shared exteriors need
          a crew that turns up when they say they will and leaves the site
          looking the same way every time. That’s the whole job.
        </p>
      </section>

      <section className="trust-money">
        <div>
          <small>SCHEDULING</small>
          <strong>Built around occupancy, not against it.</strong>
          <p>
            Common areas, refuse rooms and car parks scheduled around
            residents and business hours — not whenever suits us.
          </p>
        </div>
        <div>
          <small>CONSISTENCY</small>
          <strong>Same standard, every visit.</strong>
          <p>
            A recurring maintenance schedule instead of a one-off clean that
            starts slipping the day the next wet season hits.
          </p>
        </div>
        <div>
          <small>ACCOUNTABILITY</small>
          <strong>One call, one contractor.</strong>
          <p>
            Bins, pressure cleaning, windows and gutters through a single
            point of contact — not a different contractor for every job.
          </p>
        </div>
      </section>

      <section className="segmentServices">
        <h2>What we cover on a strata site.</h2>
        <div className="areas-service-grid">
          {list.map((s) => (
            <Link key={s.slug} href={`/${s.slug}`}>
              {s.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="legalBody">
        <h2>Getting a strata site scheduled</h2>
        <p>
          Tell us what you manage and what needs doing — refuse rooms,
          common property pressure cleaning, bin cleaning for the complex,
          gutters before the wet season. Smaller jobs get one
          straightforward price, same as any residential job; larger or
          recurring sites get a proper scope and, usually, a site visit
          rather than a number guessed over the phone.
        </p>
        <p>
          Call <a href="tel:+61434052755">0434 052 755</a> or email{" "}
          <a href="mailto:zacsbincleaning@gmail.com">
            zacsbincleaning@gmail.com
          </a>{" "}
          with the property details.
        </p>
      </section>

      <footer className="legalFooter">
        <span>CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/government">Government</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
      <small className="madeBy">Created by Siezar DeWaal</small></footer>
    </main>
  );
}
