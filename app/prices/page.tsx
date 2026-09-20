import type { Metadata } from "next";
import Crumbs from "../../components/Crumbs";
import Link from "next/link";
import { services } from "../../lib/services";
import { SUBURB_NOTE } from "../../lib/pricing";
import { QUOTE_CONFIG } from "../../lib/quote";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Cleaning Prices Cairns | Every Price in One List",
  description:
    "Every Cairns Bin Cleaning price in one plain list: pressure cleaning from $2.95/m², bins from $35.95, roofs, solar, windows and gutters. GST included.",
  alternates: { canonical: "/prices" },
};

export default function Prices() {
  return (
    <main className="pricesPage">
      <SiteHeader />
      <Crumbs trail={[["Prices", "/prices"]]} />
      <section className="pricesHead">
        <p className="eyebrow dark">SKIP THE FLUFF</p>
        <h1>Prices.</h1>
        <p>
          Real numbers, GST included. Every job starts from $179, and the
          instant quote shows you the exact figure for your place.
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
          <h3>No call-out fee</h3>
          <p>
            {SUBURB_NOTE}
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
          <h3>Every job from $179</h3>
          <p>
            A 20-minute job still means the drive, the set-up and the pack-down,
            so small jobs start from $179. Bin cleaning has its own prices
            below and isn&rsquo;t affected.
          </p>
        </div>
        <div>
          <h3>Driveways, roofs, houses and gutters: measure it yourself</h3>
          <p>
            For jobs priced on area, the <Link href="/instant-quote">instant quote</Link>{" "}
            lets you find your place on the aerial map, tap the corners of the
            area and see the price as you draw. Big or unusual jobs come back as
            a site visit instead of a guessed number.
          </p>
        </div>
        <div>
          <h3>Windows: count the panes</h3>
          <p>
            $9.95 a pane outside only, $14.95 inside and out. Enter the pane
            count on the <Link href="/window-cleaning">window cleaning</Link>{" "}
            page for your price.
          </p>
        </div>
        <div>
          <h3>Commercial sites: scoped properly</h3>
          <p>
            Car parks and hardstand get an indicative price on the map; larger
            or recurring sites get a site visit. Call 0434 052 755.
          </p>
        </div>
      </section>
      <p className="priceNote">
        All prices include GST and are the same in every suburb; the
        calculators show your exact price. Big or
        unusual jobs (over ${QUOTE_CONFIG.autoQuoteCeiling.total.toLocaleString("en-AU")}, over{" "}
        {QUOTE_CONFIG.autoQuoteCeiling.singleAreaM2.toLocaleString("en-AU")} m² or 3+ storeys)
        get a site visit before a price is locked in.
      </p>

      <SiteFooter />
    </main>
  );
}
