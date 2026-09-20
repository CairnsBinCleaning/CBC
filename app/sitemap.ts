import type { MetadataRoute } from "next";
import { services } from "../lib/services";
import { suburbPages } from "../lib/suburbs";
import { commercialPages } from "../lib/commercial";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.zacsbinandpressurecleaning.com.au";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/instant-quote`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/prices`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/service-areas`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/commercial`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/local-work`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/strata`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/government`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${siteUrl}/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const suburbRoutes: MetadataRoute.Sitemap = suburbPages.map((p) => ({
    url: `${siteUrl}/service-areas/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const commercialRoutes: MetadataRoute.Sitemap = commercialPages.map((p) => ({
    url: `${siteUrl}/commercial/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...serviceRoutes, ...commercialRoutes, ...suburbRoutes];
}
