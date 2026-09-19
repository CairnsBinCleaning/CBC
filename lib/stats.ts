// Trust numbers shown on the site. Every value here has to be the real,
// current figure — the same discipline as calloutZones in pricing.ts,
// which never invents a call-out fee it doesn't actually have yet.
//
// Set LIFETIME_BIN_CLEANS to the real count before this ships. Leave it
// null to keep the homepage stat hidden rather than show a guessed number
// — components/LiveStat.tsx only renders when this is a real number.

export const LIFETIME_BIN_CLEANS: number | null = null;

// Google Business Profile rating, read off the live listing 16 Sept 2026.
// Update both numbers when they change; the service pages read them from here.
export const GOOGLE_REVIEWS = {
  rating: 5.0,
  count: 39,
  // The business's own listing (Google Maps CID link, survives renames).
  url: "https://maps.google.com/?cid=16865214581996289120",
};
