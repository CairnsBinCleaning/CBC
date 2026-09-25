import type { MetadataRoute } from "next";
import { services } from "../lib/services";
import { suburbPages } from "../lib/suburbs";
import { commercialPages } from "../lib/commercial";
import { UPDATED } from "../lib/updated";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.cairnsbincleaning.com.au";

/* lastModified comes from lib/updated.ts: the date a person last checked the
   facts on that page, not the date of the last deploy. A date that moves on
   every build tells Google nothing. */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (
    path: string,
    priority: number,
    lastModified: string,
    changeFrequency: "weekly" | "monthly" | "yearly" = "monthly"
  ) => ({ url: `${siteUrl}${path}`, changeFrequency, priority, lastModified });

  const staticRoutes: MetadataRoute.Sitemap = [
    page("", 1, UPDATED.services, "weekly"),
    page("/instant-quote", 0.9, UPDATED.prices),
    page("/prices", 0.8, UPDATED.prices),
    page("/service-areas", 0.8, UPDATED.areas),
    page("/faq", 0.8, UPDATED.faq),
    page("/commercial", 0.8, UPDATED.commercial),
    page("/local-work", 0.6, UPDATED.commercial),
    page("/strata", 0.7, UPDATED.commercial),
    page("/government", 0.7, UPDATED.commercial),
    page("/about", 0.6, UPDATED.services),
    page("/privacy", 0.3, UPDATED.privacy, "yearly"),
    page("/terms", 0.3, UPDATED.terms, "yearly"),
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) =>
    page(`/${s.slug}`, 0.9, UPDATED.services)
  );

  const suburbRoutes: MetadataRoute.Sitemap = suburbPages.map((p) =>
    page(`/service-areas/${p.slug}`, 0.6, UPDATED.areas)
  );

  const commercialRoutes: MetadataRoute.Sitemap = commercialPages.map((p) => ({
    ...page(`/commercial/${p.slug}`, 0.8, UPDATED.commercial),
    /* Our own job photos, so Google Images can show them for local searches. */
    images: p.photos.map((ph) => `${siteUrl}${ph.src}`),
  }));

  return [...staticRoutes, ...serviceRoutes, ...commercialRoutes, ...suburbRoutes];
}
