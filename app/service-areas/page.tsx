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
          Three zones, one flat $50 call-out fee across all of them — bin
          cleaning has no call-out at all. If your suburb isn’t listed below,
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
                  ? `$${zone.fee.toFixed(2)} call-out`
                  : "Call-out fee being confirmed"}
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
              {s.name}
            </Link>
          ))}
        </div>
      </section>

      <footer className="legalFooter">
        <span>CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/prices">Prices</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
      </footer>
    </main>
  );
}
