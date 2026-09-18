import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services, getService, type Service } from "../../lib/services";
import ServicePageClient from "../../components/ServicePageClient";
import { faqJsonLd } from "../../lib/serviceFaq";

// Same fallback used in layout.tsx / sitemap.ts / robots.ts — one legacy
// placeholder domain until NEXT_PUBLIC_SITE_URL is set in Vercel.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.zacsbinandpressurecleaning.com.au";

// Same areaServed list as the LocalBusiness schema in app/layout.tsx —
// kept identical on purpose so nothing on the site contradicts itself.
// Character-for-character match with the real Google Business Profile
// "Service area" list (checked 2026-09-17). Update both places together.
const areaServed = [
  "Cairns QLD, Australia",
  "Cairns City QLD, Australia",
  "Bentley Park QLD, Australia",
  "Manoora QLD 4870, Australia",
  "Manunda QLD 4870, Australia",
  "Yorkeys Knob QLD, Australia",
  "Kanimbla QLD 4870, Australia",
  "Machans Beach QLD, Australia",
  "Redlynch QLD 4870, Australia",
  "Trinity Beach QLD, Australia",
  "Brinsmead QLD 4870, Australia",
  "Edge Hill QLD 4870, Australia",
  "Stratford QLD 4870, Australia",
  "Westcourt QLD 4870, Australia",
  "Whitfield QLD 4870, Australia",
  "Freshwater QLD 4870, Australia",
  "Gordonvale QLD 4865, Australia",
  "Mooroobool QLD 4870, Australia",
  "Smithfield QLD 4878, Australia",
  "Parramatta Park QLD 4870, Australia",
];

function serviceJsonLd(service: Service) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name,
    name: service.seoTitle,
    description: service.seoDescription,
    url: `${siteUrl}/${service.slug}`,
    image: service.gallery.map((photo) => `${siteUrl}${photo.src}`),
    areaServed,
    provider: {
      "@type": "LocalBusiness",
      name: "Cairns Bin Cleaning",
      telephone: "+61434052755",
      taxID: "36 318 413 406",
      url: siteUrl,
    },
  };

  // Only attach an Offer where the price is a real, fixed figure already
  // published elsewhere on the site — never a guessed call-out number.
  if (service.slug === "bin-cleaning") {
    jsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "AUD",
      price: "35.95",
      description: "Fortnightly bin cleaning, two standard 240L bins",
    };
  }

  if (service.slug === "solar-panel-cleaning") {
    jsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "AUD",
      price: "14.50",
      description: "Per solar panel, plus a suburb visit fee",
    };
  }

  return jsonLd;
}

/* One ImageObject per gallery photo, with the real suburb as contentLocation.
   This is the part search engines actually read for image location — EXIF GPS
   is stripped from images served on the web, so the coordinates live here too. */
function imageJsonLd(service: Service) {
  return service.gallery.map((photo) => ({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: `${siteUrl}${photo.src}`,
    url: `${siteUrl}${photo.src}`,
    caption: photo.caption,
    description: photo.alt,
    width: photo.width,
    height: photo.height,
    representativeOfPage: photo.src === service.media,
    creditText: "Cairns Bin Cleaning",
    creator: { "@type": "Organization", name: "Cairns Bin Cleaning" },
    copyrightNotice: "Cairns Bin Cleaning",
    license: `${siteUrl}/terms`,
    acquireLicensePage: `${siteUrl}/terms`,
    contentLocation: {
      "@type": "Place",
      name: `${photo.suburb}, Cairns QLD`,
      address: {
        "@type": "PostalAddress",
        addressLocality: photo.suburb,
        addressRegion: "QLD",
        addressCountry: "AU",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: photo.lat,
        longitude: photo.lon,
      },
    },
  }));
}

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) return {};

  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: { canonical: `/${service.slug}` },
    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      url: `/${service.slug}`,
      images: [{ url: service.media }],
    },
    twitter: {
      card: "summary_large_image",
      title: service.seoTitle,
      description: service.seoDescription,
      images: [service.media],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd(service)).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(service, `${siteUrl}/${service.slug}`)).replace(/</g, "\\u003c"),
        }}
      />
      {imageJsonLd(service).map((node) => (
        <script
          key={String(node.contentUrl)}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(node).replace(/</g, "\\u003c"),
          }}
        />
      ))}

      <ServicePageClient service={service} />
    </>
  );
}
