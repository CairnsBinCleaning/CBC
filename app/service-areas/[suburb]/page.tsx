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
  const done = [...new Set(page.jobs.map((j) => (j.service.slug === "commercial-cleaning" ? "commercial cleaning" : j.service.name.toLowerCase())))].join(", ");
  return {
    title: `${page.name} Pressure & Bin Cleaning | Cairns Bin Cleaning`,
    description: `Exterior cleaning in ${page.name}, Cairns: see real ${done} jobs we've done there. Instant prices online, no call-out fee.`,
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
  const done = [...new Set(page.jobs.map((j) => (j.service.slug === "commercial-cleaning" ? "commercial cleaning" : j.service.name.toLowerCase())))];
  const doneText = done.length > 1 ? `${done.slice(0, -1).join(", ")} and ${done[done.length - 1]}` : done[0];
  /* Plain answers, all true everywhere we work, with the suburb's own jobs
     in the first one. Shown on the page and sent as FAQPage schema. */
  const faq = [
    {
      q: `What have you cleaned in ${page.name}?`,
      a: `Recent ${page.name} jobs include ${doneText}. The photos on this page are those jobs, taken by us.`,
    },
    {
      q: `Do you charge more to come to ${page.name}?`,
      a: `No. One price anywhere we cover, from Palm Cove to Gordonvale, with no call-out fee. The price shown for your ${page.name} address is the price you pay, and you pay after the job.`,
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
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <main className="legalPage">
      <SiteHeader />
      <Crumbs trail={[["Service areas", "/service-areas"], [page.name, `/service-areas/${page.slug}`]]} />

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
        <TrustBar />
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

      <ReviewQuotes slug="home" />

      <section className="legalBody suburbFaq">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />
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

      <SiteFooter />
    </main>
  );
}
