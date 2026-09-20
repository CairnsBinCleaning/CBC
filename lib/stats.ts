// Trust numbers shown on the site. Every value here has to be the real,
// current figure — the same discipline as calloutZones in pricing.ts,
// which never invents a call-out fee it doesn't actually have yet.
//
// Set LIFETIME_BIN_CLEANS to the real count before this ships. Leave it
// null to keep the homepage stat hidden rather than show a guessed number
// — components/LiveStat.tsx only renders when this is a real number.

export const LIFETIME_BIN_CLEANS: number | null = null;

// Google Business Profile rating, read off the live listing 20 Sept 2026.
// Update both numbers when they change; the service pages read them from here.
export const GOOGLE_REVIEWS = {
  rating: 5.0,
  count: 40,
  // The business's own listing (Google Maps CID link, survives renames).
  url: "https://maps.google.com/?cid=16865214581996289120",
};

/* Real Google reviews, copied word for word off the listing on 20 Sept 2026.
   Shortened only with "…"; nothing reworded. Names shown as first name and
   last initial. Several older reviews name Zac (the previous owner), so the
   quotes used here are ones that describe the work, not a person.
   `services` says which service pages each one appears on. */
export type Review = { name: string; when: string; text: string; services: string[] };

export const REVIEWS: Review[] = [
  {
    name: "Semeena G.",
    when: "Sept 2026",
    text: "Called on Monday and they fitted me in the same day, cleaning bins at both our old and new properties. Our new bin had been left with mould and built-up grime, and it came up like new — clean, fresh and dried off.",
    services: ["bin-cleaning", "home"],
  },
  {
    name: "Kerri C.",
    when: "June 2026",
    text: "My husband had this company come and preasure wash our driveway a couple of weeks ago. The fellow Brent who did the job was very pleasent and did an amazing job, also made our bins like new. Would highly recommend this company.",
    services: ["pressure-cleaning", "home"],
  },
  {
    name: "Caleb M.",
    when: "2025",
    text: "The roof and driveway he cleaned ended up insanely clean and had very good customer service.",
    services: ["roof-cleaning", "pressure-cleaning"],
  },
  {
    name: "Ainsley M.",
    when: "2025",
    text: "…had them come in to pressure clean our house exterior, driveway, outdoor entertainment area and roofing and was very happy with the job they done, they were punctual, efficient and job was done for a great rate…",
    services: ["house-washing", "roof-cleaning", "home"],
  },
  {
    name: "Josiah W.",
    when: "2025",
    text: "Very professional, very reasonably priced. The actual workers that come and do the cleaning super polite and down to earth fellas.",
    services: ["pressure-cleaning", "house-washing", "commercial-cleaning", "window-cleaning", "gutter-cleaning", "solar-panel-cleaning"],
  },
  {
    name: "Lennon H.",
    when: "Sept 2026",
    text: "My bins smelt absolutely disgusting before having this team clean my bins. They now smell amazing!!!!",
    services: ["bin-cleaning"],
  },
  {
    name: "Jon E.",
    when: "2025",
    text: "Friendly, considerate, thorough, professional, knowledgeable and competent. I will have these guys back again when I need them.",
    services: ["commercial-cleaning", "window-cleaning", "gutter-cleaning", "solar-panel-cleaning", "house-washing"],
  },
];

export const reviewsFor = (slug: string, n = 3) => REVIEWS.filter((r) => r.services.includes(slug)).slice(0, n);
