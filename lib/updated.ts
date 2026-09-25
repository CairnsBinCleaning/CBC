/* When each page's facts were last checked by a person.

   Shown on the page ("Last checked 20 September 2026") and sent to Google as
   the sitemap's lastmod. Only bump a date when the content actually changed —
   a date that moves on every deploy tells Google nothing and tells a customer
   less. */
export const UPDATED = {
  prices: "2026-09-20",
  privacy: "2026-09-25",
  terms: "2026-09-20",
  faq: "2026-09-20",
  services: "2026-09-25",
  commercial: "2026-09-20",
  areas: "2026-09-25",
} as const;

export function auDate(iso: string) {
  return new Date(iso + "T00:00:00+10:00").toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
