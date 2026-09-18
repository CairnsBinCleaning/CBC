/* Per-service questions and answers.
 *
 * Shown on each service page AND emitted as FAQPage structured data from the
 * same list, so the schema can never say something the page doesn't.
 *
 * Every answer is assembled from facts already published elsewhere on the
 * site (lib/services.ts, lib/pricing.ts, /faq, /terms). Nothing new is
 * claimed here. Change a fact at its source and this follows.
 */

import { calloutZones } from "./pricing";
import type { Service } from "./services";

export type QA = { q: string; a: string };

const MEASURABLE = new Set(["pressure-cleaning", "roof-cleaning", "house-washing", "commercial-cleaning"]);

const lower = (s: string) => s.toLowerCase();

function areasAnswer() {
  const zones = calloutZones.map((z) => z.name).join(", ");
  const first = calloutZones[calloutZones.length - 1]?.suburbs.slice(-1)[0];
  const last = calloutZones.find((z) => z.name === "Northern Beaches")?.suburbs.slice(-1)[0];
  return (
    `Greater Cairns, across three zones: ${zones}` +
    (first && last ? ` — roughly ${first} to ${last}.` : ".") +
    " If your suburb isn’t on our list, call and we’ll check it."
  );
}

function priceAnswer(s: Service) {
  if (s.slug === "bin-cleaning") return s.priceDetail + " Nothing is added for your suburb.";
  if (s.slug === "solar-panel-cleaning") return s.priceDetail;
  const fee = calloutZones[0]?.fee;
  return (
    s.priceDetail +
    (fee != null ? ` A flat $${fee} visit fee applies anywhere we service in Cairns.` : "")
  );
}

function bookAnswer(s: Service) {
  if (s.slug === "bin-cleaning")
    return "Pick a plan and book online on this page, or call 0434 052 755.";
  if (s.slug === "solar-panel-cleaning")
    return "Enter your suburb and panel count on this page to see the total, then book online — or call 0434 052 755.";
  if (MEASURABLE.has(s.slug))
    return "Use the instant quote on this page: find your place on the aerial map, tap the corners of the area, and the price appears. Accept it to book, or call 0434 052 755.";
  return "Send a quote request from this page with a short description of the job, or call 0434 052 755. We’ll confirm the price before anything is booked.";
}

/* A few services have a naming question people actually search. The
   answers restate what the page copy already says. */
const EXTRA: Record<string, QA[]> = {
  "pressure-cleaning": [
    {
      q: "Is pressure cleaning the same as pressure washing?",
      a: "Yes. Pressure washing and pressure cleaning are the same job here. We’re a local crew, so the person who quotes it is the person who does it.",
    },
  ],
};

export function serviceFaq(s: Service): QA[] {
  return [
    { q: `How much does ${lower(s.name)} cost in Cairns?`, a: priceAnswer(s) },
    { q: "Which areas do you cover?", a: areasAnswer() },
    { q: `How do I book ${lower(s.name)}?`, a: bookAnswer(s) },
    ...(EXTRA[s.slug] ?? []),
    {
      q: "Are you insured?",
      a: "Yes. Cairns Bin Cleaning carries public liability insurance and operates under ABN 36 318 413 406.",
    },
  ];
}

export function faqJsonLd(s: Service, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url,
    mainEntity: serviceFaq(s).map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
