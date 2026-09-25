import type { Metadata } from "next";
import Crumbs from "../../../components/Crumbs";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { services } from "../../../lib/services";
import { getSuburbPage, suburbPages, suburbSlug } from "../../../lib/suburbs";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import TrustBar from "../../../components/TrustBar";
import ReviewQuotes from "../../../components/ReviewQuotes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cairnsbincleaning.com.au";

/* One page per suburb we cover. Each one carries its own real facts —
   postcode, distance from base, the jobs photographed there or the nearest
   ones we have, labelled honestly. See lib/suburbs.ts. */

export function generateStaticParams() {
  return suburbPages.map((p) => ({ suburb: p.slug }));
}

export const dynamicParams = false;

const serviceList = (page: NonNullable<ReturnType<typeof getSuburbPage>>) => [
  ...new Set(
    page.jobs.map((j) =>
      j.service.slug === "commercial-cleaning" ? "commercial cleaning" : j.service.name.toLowerCase()
    )
  ),
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ suburb: string }>;
}): Promise<Metadata> {
  const page = getSuburbPage((await params).suburb);
  if (!page) return {};
  const done = serviceList(page).join(", ");
  const hero = page.jobs[0]?.photo ?? page.nearby[0]?.photo;
  /* Long suburb names would push the title past what Google shows. */
  const title =
    `${page.name} Pressure & Bin Cleaning | Cairns Bin Cleaning`.length <= 60
      ? `${page.name} Pressure & Bin Cleaning | Cairns Bin Cleaning`
      : `${page.name} Pressure & Bin Cleaning | Cairns`;
  const description = page.jobs.length
    ? `Exterior cleaning in ${page.name} ${page.geo.postcode ?? "Cairns"}: real ${done} jobs we've done there, instant prices online and no call-out fee.`
    : `Pressure cleaning, bin cleaning, roofs, windows and solar in ${page.name} ${page.geo.postcode ?? "Cairns"}. One price anywhere we cover, no call-out fee, instant prices online.`;
  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical: `/service-areas/${page.slug}` },
    openGraph: {
      title: `Exterior cleaning in ${page.name} — Cairns Bin Cleaning`,
      url: `/service-areas/${page.slug}`,
      /* Every page gets a share image; a locality with no nearby job photo
         falls back to the site default. */
      images: hero ? [{ url: hero.src, alt: hero.alt }] : [{ url: "/media/IMG_3027.jpg" }],
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

  const done = serviceList(page);
  const doneText = done.length > 1 ? `${done.slice(0, -1).join(", ")} and ${done[done.length - 1]}` : done[0];
  const nearestName = page.nearby[0]?.photo.suburb;
  const nearestKm = page.nearby[0]?.km;

  /* Plain answers, true everywhere we work, with this suburb's own facts in
     them. Shown on the page and sent to Google as FAQPage data. */
  const faq = [
    page.jobs.length
      ? {
          q: `What have you cleaned in ${page.name}?`,
          a: `Recent ${page.name} jobs include ${doneText}. The photos on this page are those jobs, taken by us.`,
        }
      : {
          q: `Have you worked in ${page.name}?`,
          a: `${page.name} is inside our normal run and every service on this site is available there. We haven't photographed a job in ${page.name} yet, so this page shows the nearest jobs we have${nearestName ? `, in ${nearestName}${nearestKm ? `, about ${nearestKm} km away` : ""}` : ""} — labelled with the suburb they were actually taken in.`,
        },
    {
      q: `Do you charge more to come to ${page.name}?`,
      a: `No. ${page.name} is about ${page.geo.kmFromBase ?? "—"} km from our base, and the price is the same as a job around the corner. One price anywhere we cover, from Palm Cove to Gordonvale, no call-out fee, and you pay after the job.`,
    },
    {
      q: `How do I get a price in ${page.name}?`,
      a: `Type your ${page.name} address into the instant quote, tap the corners of the driveway, roof or patio on the aerial map, and the price appears. Bin and solar panel cleaning book online on their own pages. Or call 0434 052 755.`,
    },
    {
      q: `Do you do commercial and strata work in ${page.name}?`,
      a: `Yes: car parks, bin rooms, shopfronts, roofs, commercial kitchens and strata common areas. We carry $20 million public liability insurance and a safe work method statement for site work.`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `Exterior cleaning in ${page.name}`,
      serviceType: "Pressure cleaning, bin cleaning, roof, house, window, gutter and solar panel cleaning",
      url: `${siteUrl}/service-areas/${page.slug}`,
      provider: { "@type": "LocalBusiness", "@id": `${siteUrl}/#business`, name: "Cairns Bin Cleaning" },
      areaServed: {
        "@type": "Place",
        name: `${page.name}, Queensland`,
        ...(page.geo.postcode ? { address: { "@type": "PostalAddress", addressLocality: page.name, postalCode: page.geo.postcode, addressRegion: "QLD", addressCountry: "AU" } } : {}),
        ...(page.geo.lat != null && page.geo.lon != null
          ? { geo: { "@type": "GeoCoordinates", latitude: page.geo.lat, longitude: page.geo.lon } }
          : {}),
      },
    },
  ];

  return (
    <main className="legalPage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />
      <Crumbs trail={[["Service areas", "/service-areas"], [page.name, `/service-areas/${page.slug}`]]} />

      <section className="areasHead">
        <h1>
          <span className="eyebrow h1-kicker">Exterior cleaning in</span> {page.name}.
        </h1>
        <p>
          We work right across {page.name}
          {page.geo.postcode ? ` ${page.geo.postcode}` : ""}
          {page.geo.kmFromBase != null
            ? `, about ${page.geo.kmFromBase} km from our base in Mount Sheridan`
            : ""}
          . The drive costs you nothing: one price anywhere we cover, no
          call-out fee, and you pay after the job. Put your address into the
          instant quote and the price you see is the price for your place.
        </p>
        <TrustBar />
      </section>

      {page.jobs.length > 0 && (
        <section className="suburbJobs">
          <h2>Our work in {page.name}.</h2>
          <div className="suburbJobGrid">
            {page.jobs.map(({ photo, service }, i) => (
              <figure key={photo.src}>
                <Image
                  priority={i === 0}
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
      )}

      {page.jobs.length === 0 && page.nearby.length > 0 && (
        <section className="suburbJobs">
          <h2>Our closest work to {page.name}.</h2>
          <p className="suburbNearbyNote">
            We haven&rsquo;t photographed a job in {page.name} yet. These are
            the nearest ones we have, and each is labelled with the suburb it
            was actually taken in — we don&rsquo;t move photos around.
          </p>
          <div className="suburbJobGrid">
            {page.nearby.map(({ photo, service, km }, i) => (
              <figure key={photo.src}>
                <Image
                  priority={i === 0}
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 850px) 100vw, 33vw"
                  quality={70}
                />
                <figcaption>
                  <Link href={`/${service.slug}`}>{service.name}</Link>
                  <span>
                    {photo.caption} Taken in{" "}
                    <Link href={`/service-areas/${suburbSlug(photo.suburb ?? "")}`}>{photo.suburb}</Link>
                    {km != null ? `, about ${km} km from ${page.name}.` : "."}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

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

      <ReviewQuotes slug="home" />

      <section className="legalBody suburbFaq">
        <h2>{page.name} questions, answered.</h2>
        {faq.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
        <p>
          Business or strata property in {page.name}? See{" "}
          <Link href="/commercial">commercial &amp; industrial cleaning</Link>.
        </p>
      </section>

      {page.neighbours.length > 0 && (
        <section className="areasBody suburbNearby">
          <div className="zone-card">
            <span>NEAREST SUBURBS WE ALSO COVER</span>
            <div className="suburb-chips">
              {page.neighbours.map((n) => (
                <Link key={n} href={`/service-areas/${suburbSlug(n)}`}>
                  {n}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
