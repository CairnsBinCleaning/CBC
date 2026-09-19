/* Suburb landing pages (/service-areas/[suburb]).

   A page only exists for a suburb where we have at least one real,
   geotagged job photo from that suburb. That is what makes each page
   different from the next: the work shown is work done there. A page per
   suburb with nothing but the name swapped would be a doorway page, which
   Google treats as spam, so suburbs without a photo stay as plain names on
   /service-areas until a job there gets photographed.

   Everything else on these pages comes from the same sources as the rest of
   the site: calloutZones (lib/pricing.ts) and services (lib/services.ts). */

import { calloutZones } from "./pricing";
import { services, type Service, type ServicePhoto } from "./services";

export type SuburbJob = { photo: ServicePhoto; service: Service };

export type SuburbPage = {
  slug: string;
  name: string;
  zone: string;
  fee: number | null;
  neighbours: string[]; // other suburbs in the same zone
  jobs: SuburbJob[];
};

export function suburbSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function jobsIn(name: string): SuburbJob[] {
  const jobs: SuburbJob[] = [];
  for (const service of services) {
    for (const photo of service.gallery) {
      if (photo.suburb === name) jobs.push({ photo, service });
    }
  }
  return jobs;
}

export const suburbPages: SuburbPage[] = calloutZones.flatMap((zone) =>
  zone.suburbs
    .map((name) => ({
      slug: suburbSlug(name),
      name,
      zone: zone.name,
      fee: zone.fee,
      neighbours: zone.suburbs.filter((s) => s !== name),
      jobs: jobsIn(name),
    }))
    .filter((page) => page.jobs.length > 0)
);

export function getSuburbPage(slug: string) {
  return suburbPages.find((p) => p.slug === slug);
}
