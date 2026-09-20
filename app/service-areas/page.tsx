import type { Metadata } from "next";
import Crumbs from "../../components/Crumbs";
import Link from "next/link";
import { calloutZones, SUBURB_NOTE } from "../../lib/pricing";
import { services } from "../../lib/services";
import { suburbPages, suburbSlug } from "../../lib/suburbs";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Service Areas: Gordonvale to Palm Cove | Cairns Bin Cleaning",
  description:
    "Cairns Bin Cleaning services Cairns City, the Northern Beaches and the southside suburbs through to Gordonvale — bin cleaning, pressure cleaning, window cleaning and more.",
  alternates: { canonical: "/service-areas" },
};

export default function ServiceAreas() {
  return (
    <main className="legalPage">
      <SiteHeader />
      <Crumbs trail={[["Service areas", "/service-areas"]]} />

      <section className="areasHead">
        <p className="eyebrow dark">WHERE WE WORK</p>
        <h1>Cairns &amp; Far North Queensland.</h1>
        <p>
          Every service, in every suburb below. {SUBURB_NOTE} If your suburb
          isn’t listed, call and we’ll confirm whether we cover it.
        </p>
      </section>

      <section className="areasBody">
        <div className="zone-grid">
          {calloutZones.map((zone) => (
            <div key={zone.name} className="zone-card">
              <span>SERVICE ZONE</span>
              <h2>{zone.name}</h2>
              <p className="zone-note">
                {zone.suburbs.length > 1
                  ? `Every service on this site is available in all ${zone.suburbs.length} ${zone.name} suburbs.`
                  : `Every service on this site is available in ${zone.name}.`}
              </p>
              <div className="suburb-chips">
                {zone.suburbs.map((suburb) =>
                  suburbPages.some((p) => p.name === suburb) ? (
                    <Link key={suburb} href={`/service-areas/${suburbSlug(suburb)}`}>
                      {suburb}
                    </Link>
                  ) : (
                    <span key={suburb}>{suburb}</span>
                  )
                )}
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

      <SiteFooter />
    </main>
  );
}
