import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { services } from "../../../lib/services";
import { getSuburbPage, suburbPages, suburbSlug } from "../../../lib/suburbs";

/* One page per suburb where we have real job photos. See lib/suburbs.ts for
   why suburbs without a photo don't get a page. */

export function generateStaticParams() {
  return suburbPages.map((p) => ({ suburb: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ suburb: string }>;
}): Promise<Metadata> {
  const page = getSuburbPage((await params).suburb);
  if (!page) return {};
  const done = [...new Set(page.jobs.map((j) => j.service.name.toLowerCase()))].join(", ");
  return {
    title: `${page.name} Pressure Cleaning, Bin Cleaning & More | Cairns Bin Cleaning`,
    description: `Exterior cleaning in ${page.name}, Cairns: see real ${done} jobs we've done there. Instant prices online, no call-out fee. Call 0434 052 755.`,
    alternates: { canonical: `/service-areas/${page.slug}` },
    openGraph: {
      title: `Exterior cleaning in ${page.name} — Cairns Bin Cleaning`,
      url: `/service-areas/${page.slug}`,
      images: [{ url: page.jobs[0].photo.src, alt: page.jobs[0].photo.alt }],
    },
  };
}

export default async function SuburbPage({
  params,
}: {
  params: Promise<{ suburb: string }>;
}) {
  const page = getSuburbPage((await params).suburb);
  if (!page) notFound();

  const withPages = new Set(suburbPages.map((p) => p.name));

  return (
    <main className="legalPage">
      <header className="nav navLight">
        <Link href="/" className="brand">
          <span>CAIRNS</span>
          <small>BIN CLEANING</small>
        </Link>
        <nav>
          <Link href="/service-areas">Areas</Link>
          <a href="tel:+61434052755">0434 052 755</a>
        </nav>
      </header>

      <section className="areasHead">
        <h1>
          <span className="eyebrow h1-kicker">Exterior cleaning in</span>{" "}
          {page.name}.
        </h1>
        <p>
          We work right across {page.name}, with no call-out fee. Below is work
          we&rsquo;ve done in {page.name}, and everything we can do there. Put
          your address into the instant quote and the price you see is the
          price for your place.
        </p>
      </section>

      <section className="suburbJobs">
        <h2>Our work in {page.name}.</h2>
        <div className="suburbJobGrid">
          {page.jobs.map(({ photo, service }) => (
            <figure key={photo.src}>
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 850px) 100vw, 33vw"
                quality={70}
              />
              <figcaption>
                <Link href={`/${service.slug}`}>{service.name}</Link>
                <span>{photo.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="areas-services">
        <h2>What we do in {page.name}.</h2>
        <div className="areas-service-grid">
          {services.map((s) => (
            <Link key={s.slug} href={`/${s.slug}`}>
              <strong>{s.name}</strong>
              <small>{s.price}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="priceHow areasHow">
        <h2>Booking in {page.name}.</h2>
        <div>
          <h3>Bins and solar panels</h3>
          <p>
            Book online on the <Link href="/bin-cleaning">bin cleaning</Link> or{" "}
            <Link href="/solar-panel-cleaning">solar panel cleaning</Link> page.
          </p>
        </div>
        <div>
          <h3>Driveways, roofs and patios</h3>
          <p>
            Use the <Link href="/instant-quote">instant quote</Link>: type your{" "}
            {page.name} address, tap the corners of the area on the aerial map,
            and the price appears.
          </p>
        </div>
        <div>
          <h3>Anything else</h3>
          <p>
            Send a quote request from the service page or call 0434 052 755.
            We confirm the price before anything is booked in.
          </p>
        </div>
      </section>

      {page.neighbours.length > 0 && (
      <section className="areasBody suburbNearby">
        <div className="zone-card">
          <span>ALSO IN THE {page.zone.toUpperCase()} ZONE</span>
          <div className="suburb-chips">
            {page.neighbours.map((n) =>
              withPages.has(n) ? (
                <Link key={n} href={`/service-areas/${suburbSlug(n)}`}>
                  {n}
                </Link>
              ) : (
                <span key={n}>{n}</span>
              )
            )}
          </div>
        </div>
      </section>
      )}

      <footer className="legalFooter">
        <span>CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/service-areas">Areas</Link>
          <Link href="/prices">Prices</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <small className="madeBy">Created by <a href="/faq#siezar-dewaal">Siezar DeWaal</a></small>
      </footer>
    </main>
  );
}
