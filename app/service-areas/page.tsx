import type { Metadata } from "next";
import Link from "next/link";
import { calloutZones } from "../../lib/pricing";
import { services } from "../../lib/services";

export const metadata: Metadata = {
  title: "Service Areas | Cairns Bin Cleaning",
  description:
    "Cairns Bin Cleaning services Cairns City, the Northern Beaches and the southside suburbs through to Gordonvale — bin cleaning, pressure cleaning, window cleaning and more.",
  alternates: { canonical: "/service-areas" },
};

export default function ServiceAreas() {
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

      <section className="areasHead">
        <p className="eyebrow dark">WHERE WE WORK</p>
        <h1>Cairns &amp; Far North Queensland.</h1>
        <p>
          Three zones, one flat $50 visit fee across all of them — bin
          cleaning has nothing added at all. If your suburb isn’t listed below,
          call and we’ll confirm whether we cover it.
        </p>
      </section>

      <section className="areasBody">
        <div className="zone-grid">
          {calloutZones.map((zone) => (
            <div key={zone.name} className="zone-card">
              <span>SERVICE ZONE</span>
              <h2>{zone.name}</h2>
              <p>
                {zone.fee != null
                  ? `$${zone.fee.toFixed(2)} visit fee`
                  : "Visit fee being confirmed"}
              </p>
              <p className="zone-note">
                Every service on this site is available in all{" "}
                {zone.suburbs.length} {zone.name} suburbs.
              </p>
              <div className="suburb-chips">
                {zone.suburbs.map((suburb) => (
                  <span key={suburb}>{suburb}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="areas-services">
        <h2>What we clean, wherever you are.</h2>
        <div className="areas-service-grid">
          {services.map((s) => (
            <Link key={s.slug} href={`/${s.slug}`}>
              <strong>{s.name}</strong>
              <small>{s.short}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="priceHow areasHow">
        <h2>Booking, wherever you are.</h2>
        <div>
          <h3>Bins and solar panels</h3>
          <p>
            Book online on the <Link href="/bin-cleaning">bin cleaning</Link> or{" "}
            <Link href="/solar-panel-cleaning">solar panel cleaning</Link> page.
            Pick your suburb and the price is there before you book.
          </p>
        </div>
        <div>
          <h3>Driveways, roofs and patios</h3>
          <p>
            The <Link href="/instant-quote">instant quote</Link> works for any
            address from Gordonvale to Palm Cove: type it in, tap the corners of
            the area on the aerial map, and accept the price to book.
          </p>
        </div>
        <div>
          <h3>Windows, gutters and commercial sites</h3>
          <p>
            Send a quote request from the service page or call 0434 052 755. We
            confirm the price before anything is booked in.
          </p>
        </div>
      </section>

      <footer className="legalFooter">
        <span>CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/prices">Prices</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
      <small className="madeBy">Created by Siezar DeWaal</small></footer>
    </main>
  );
}
