import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ComplianceDocs from "../../components/ComplianceDocs";
import WalkthroughForm from "../../components/WalkthroughForm";
import { commercialPages } from "../../lib/commercial";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Commercial & Industrial Cleaning Cairns | CBC Exterior & Property Maintenance",
  description:
    "Commercial and industrial cleaning in Cairns: car parks, bin rooms, shopfronts, building and roof washes, graffiti, commercial kitchens and equipment, deep cleans and industrial sites. Insured, scheduled around trading hours.",
  alternates: { canonical: "/commercial" },
};

export default function Commercial() {
  return (
    <main className="legalPage">
      <SiteHeader commercial />

      <section className="segmentHero">
        <h1>
          <span className="eyebrow dark" style={{ display: "block", lineHeight: 1.5, marginBottom: 12 }}>
            COMMERCIAL &amp; INDUSTRIAL CLEANING CAIRNS
          </span>
          One contractor for the whole site, inside and out.
        </h1>
        <p>
          Car parks, bin rooms, refuse chutes, shopfronts, buildings, roofs, windows inside and out, graffiti,
          commercial kitchens and equipment, deep cleans and industrial sites. Walked first, priced in writing,
          scheduled around your trading hours.
        </p>
      </section>

      <section className="commercial-photos" aria-label="Our commercial work">
        {[
          { src: "/media/commercial-carpark-rotary-cairns-city.jpg", alt: "Rotary surface cleaner on a commercial car park ramp in Cairns City", w: 1200, h: 1600, s: "Cairns City" },
          { src: "/media/IMG_3156.jpg", alt: "School roof in Brinsmead after a roof soft wash", w: 2400, h: 1800, s: "Brinsmead" },
          { src: "/media/strata-refuse-room-cairns-city.jpg", alt: "Refuse room with bulk bins cleaned in the Cairns CBD", w: 1296, h: 972, s: "Cairns City" },
          { src: "/media/commercial-bulk-bins-portsmith.jpg", alt: "Bulk commercial bins cleaned at a Portsmith site", w: 1200, h: 1600, s: "Portsmith" },
        ].map((ph) => (
          <figure key={ph.src}>
            <Image src={ph.src} alt={ph.alt} width={ph.w} height={ph.h} sizes="(max-width: 850px) 100vw, 25vw" quality={60} />
            <figcaption>Our work, {ph.s}</figcaption>
          </figure>
        ))}
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
          <Link href="/local-work">Local work we&rsquo;ve done</Link>
        </div>
      </section>

      <section className="document-grid">
        <ComplianceDocs />
      </section>

      <WalkthroughForm
        audience="Commercial"
        options={["Car park", "Bin room / refuse chute", "Shopfront / footpath", "Building / roof wash", "Graffiti", "Kitchen / exhaust fans", "Oven / dishwasher / descaling", "Deep clean", "Industrial site", "Windows", "Timber"]}
      />

      <SiteFooter commercial />
    </main>
  );
}
