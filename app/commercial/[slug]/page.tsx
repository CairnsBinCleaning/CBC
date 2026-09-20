import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ComplianceDocs from "../../../components/ComplianceDocs";
import WalkthroughForm from "../../../components/WalkthroughForm";
import { commercialPages, getCommercialPage } from "../../../lib/commercial";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.cairnsbincleaning.com.au";

export function generateStaticParams() {
  return commercialPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getCommercialPage(slug);
  if (!page) return {};
  const image = page.photos[0]?.src ?? "/media/commercial-carpark-rotary-cairns-city.jpg";
  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `/commercial/${page.slug}` },
    openGraph: { title: page.seoTitle, description: page.seoDescription, url: `/commercial/${page.slug}`, images: [{ url: image }] },
  };
}

export default async function CommercialNiche({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getCommercialPage(slug);
  if (!page) notFound();

  const url = `${siteUrl}/commercial/${page.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.keyword,
      serviceType: page.name,
      description: page.seoDescription,
      url,
      areaServed: { "@type": "City", name: "Cairns" },
      provider: { "@type": "LocalBusiness", "@id": `${siteUrl}/#business`, name: "Cairns Bin Cleaning" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];
  const others = commercialPages.filter((p) => p.slug !== page.slug);

  return (
    <main className="legalPage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SiteHeader commercial />

      <section className="segmentHero">
        <h1>
          <span className="eyebrow dark" style={{ display: "block", lineHeight: 1.5, marginBottom: 12 }}>
            {page.keyword.toUpperCase()}
          </span>
          {page.heading}
        </h1>
        <p>{page.intro}</p>
        <p>
          <a href="#walkthrough" style={{ fontWeight: 700, textDecoration: "underline" }}>
            Book a site walkthrough →
          </a> or call{" "}
          <a href="tel:+61434052755">0434 052 755</a>
        </p>
      </section>

      {page.photos.length > 0 && (
        <section className="commercial-photos">
          {page.photos.map((ph) => (
            <figure key={ph.src}>
              <Image src={ph.src} alt={ph.alt} width={ph.width} height={ph.height} sizes="(max-width: 850px) 100vw, 33vw" quality={65} />
              <figcaption>Our work, {ph.suburb}</figcaption>
            </figure>
          ))}
        </section>
      )}

      <section className="legalBody">
        <h2>What we clean</h2>
        <ul>
          {page.covers.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <h2>Who it&rsquo;s for</h2>
        <p>{page.who}</p>
        <h2>How it works</h2>
        <p>
          Book a walkthrough below. We walk the site with you, then send one written price and a scope. Work is
          scheduled around your trading hours, and recurring schedules are available. Every job starts from $179, GST
          included.
        </p>
        <p>{page.searches}</p>
      </section>

      <section className="document-grid">
        <ComplianceDocs />
      </section>

      <WalkthroughForm audience="Commercial" options={page.needs} />

      <section className="legalBody">
        <h2>Questions</h2>
        {page.faq.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
        <h2>Other commercial work</h2>
        <p>
          {others.map((o, i) => (
            <span key={o.slug}>
              {i > 0 && " · "}
              <Link href={`/commercial/${o.slug}`}>{o.name}</Link>
            </span>
          ))}
          {" · "}
          <Link href="/strata">Strata</Link>
          {" · "}
          <Link href="/government">Government</Link>
        </p>
      </section>

      <SiteFooter commercial />
    </main>
  );
}
