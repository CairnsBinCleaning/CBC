import type { Metadata } from "next";
import Link from "next/link";
import { services } from "../../lib/services";

export const metadata: Metadata = {
  title: "Prices | Cairns Bin Cleaning",
  description:
    "Every Cairns Bin Cleaning price in one plain list — pressure cleaning, bin cleaning, roof cleaning, solar and more.",
  alternates: { canonical: "/prices" },
};

export default function Prices() {
  return (
    <main className="pricesPage">
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
      <section className="pricesHead">
        <p className="eyebrow dark">SKIP THE FLUFF</p>
        <h1>Prices.</h1>
        <p>
          What we can price simply, we show simply. Where access, area or
          site conditions matter, we tell you that too.
        </p>
      </section>
      <section className="priceRows">
        {services.map((s) => (
          <Link key={s.slug} href={"/" + s.slug}>
            <span>{s.name}</span>
            <strong>{s.price}</strong>
            <b>→</b>
            <em className="priceDetail">{s.priceDetail}</em>
          </Link>
        ))}
      </section>

      {/* Every figure here already appears elsewhere on the site
          (lib/services.ts, lib/pricing.ts, /terms). Nothing new is claimed. */}
      <section className="priceHow">
        <h2>How our prices work.</h2>
        <div>
          <h3>One flat $50 visit fee</h3>
          <p>
            Anywhere we service in Cairns, from Palm Cove to Gordonvale, the
            visit fee is the same $50. It covers getting the crew and gear to
            you. Bin cleaning is the exception: nothing is added for your suburb.
          </p>
        </div>
        <div>
          <h3>Bins: a set price per visit</h3>
          <p>
            Two standard 240L bins are $35.95 a clean fortnightly, $39.95 every
            four weeks, or $74.95 as a one-off. Recurring plans run on a
            3-service minimum. Book it online on the bin cleaning page.
          </p>
        </div>
        <div>
          <h3>Driveways, roofs and patios: measure it yourself</h3>
          <p>
            For jobs priced on area, the <Link href="/instant-quote">instant quote</Link>{" "}
            lets you find your place on the aerial map, tap the corners of the
            area and see the price as you draw. Big or unusual jobs come back as
            a site visit instead of a guessed number.
          </p>
        </div>
        <div>
          <h3>Everything else: confirmed before we book</h3>
          <p>
            Windows, gutters and commercial sites depend on access, height and
            what&rsquo;s there. Send the details from the service page or call
            0434 052 755, and we confirm the price with you before anything is
            booked in. Prices include GST.
          </p>
        </div>
      </section>
      <p className="priceNote">
        Solar is $14.50 per panel plus a flat $50 visit fee,
        anywhere we service in Cairns. Bin cleaning has nothing
        added. Every other job is confirmed with you before we
        book anything in.
      </p>

      <footer className="service-footer">
        <span>CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/service-areas">Areas</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      <small className="madeBy">Created by Siezar DeWaal</small></footer>
    </main>
  );
}
