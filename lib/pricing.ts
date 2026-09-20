export const SOLAR_RATE = 14.5;
export const SOLAR_MIN = 179;

/* Suburb travel loading: SWITCHED OFF 20 Sept 2026 (Siezar: one price
   anywhere in Cairns, no visit fees ever). Every loading below is 0. The zone
   lists stay because the address search and service-area pages use them.
   History: set 19 Sept 2026, replacing the flat $50 visit fee. The job price goes up by a percentage that grows with the drive
   from base in Mount Sheridan: Southside +3%, Cairns central +8%, Northern
   Beaches +15%. No minimum.

   - Bin cleaning: nothing added, ever.
   - Solar: the loading applies, except when the clean is booked on the
     customer's bin-clean day, when we're already in the street.
   Change a percentage here and every price on the site follows. */
export const calloutZones = [
  {
    name: "Cairns central",
    suburbs: [
      "Cairns City","Cairns North","Bungalow","Portsmith","Westcourt",
      "Parramatta Park","Earlville","Manoora","Manunda","Aeroglen",
      "Freshwater","Stratford","Edge Hill","Whitfield","Brinsmead"
    ],
    loading: 0,
  },
  {
    name: "Northern Beaches",
    suburbs: [
      "Machans Beach","Holloways Beach","Yorkeys Knob","Caravonica",
      "Kamerunga","Smithfield","Trinity Park","Trinity Beach",
      "Kewarra Beach","Clifton Beach","Palm Cove","Ellis Beach"
    ],
    loading: 0,
  },
  {
    /* Set by Siezar 19 Sept: its own sector, between central and the
       Northern Beaches. */
    name: "Redlynch",
    suburbs: ["Redlynch"],
    loading: 0,
  },
  {
    name: "Southside",
    suburbs: [
      "Bayview Heights","Mooroobool","Kanimbla","Woree","White Rock",
      "Mount Sheridan","Bentley Park","Edmonton","Gordonvale"
    ],
    loading: 0,
  },
];

/* A suburb that isn't named above (the address search covers every street
   in these postcodes) falls into the zone its postcode belongs to. */
const ZONE_BY_POSTCODE: Record<string, string> = {
  "4865": "Southside",
  "4868": "Southside",
  "4869": "Southside",
  "4870": "Cairns central",
  "4878": "Northern Beaches",
  "4879": "Northern Beaches",
};

export type ZoneMatch = { zone: string; suburb: string; loading: number };

export function findCallout(suburb: string, postcode?: string): ZoneMatch | null {
  const clean = suburb.trim().toLowerCase();
  for (const zone of calloutZones) {
    const match = zone.suburbs.find((s) => s.toLowerCase() === clean);
    if (match) return { zone: zone.name, suburb: match, loading: zone.loading };
  }
  const byPostcode = postcode ? calloutZones.find((z) => z.name === ZONE_BY_POSTCODE[postcode]) : undefined;
  if (byPostcode && suburb.trim()) {
    return { zone: byPostcode.name, suburb: suburb.trim(), loading: byPostcode.loading };
  }
  return null;
}

/** The loading in dollars on a job price, rounded to the cent. */
export function travelLoading(jobPrice: number, loading: number) {
  return Math.round(jobPrice * loading * 100) / 100;
}

/** "+8%" */
export const pct = (loading: number) => `+${Math.round(loading * 100)}%`;

/** "Southside +3%, Cairns central +8%, Northern Beaches +15%" */
export function loadingSummary() {
  return [...calloutZones]
    .sort((a, b) => a.loading - b.loading)
    .map((z) => `${z.name} ${pct(z.loading)}`)
    .join(", ");
}

/* The zone for a full address line, e.g. "12 Smith Street, Edge Hill 4870"
   from the address search, or an OpenStreetMap label with the postcode as
   its own part. A named suburb wins; otherwise the postcode decides. */
export function zoneFromAddress(label: string): ZoneMatch | null {
  const parts = label.split(",").map((p) => p.trim()).filter(Boolean);
  const postcode = label.match(/\b(48\d\d)\b/)?.[1];
  for (const part of parts) {
    const name = part.replace(/\s*\b48\d\d\b\s*/, " ").trim();
    const hit = findCallout(name);
    if (hit) return hit;
  }
  if (!postcode) return null;
  const withCode = parts.find((p) => p.includes(postcode));
  const guess = withCode ? withCode.replace(postcode, "").trim() : "";
  const suburb = guess && !/^(qld|queensland)$/i.test(guess) ? guess : parts[parts.length - 3] ?? "Cairns";
  return findCallout(suburb, postcode);
}

/* Solar price, shared by the calculator and the booking action so they can
   never disagree. The bin-clean-day option took the suburb loading off;
   with every loading at 0 (20 Sept) it no longer changes the price and is
   kept only so the booking says which day suits. */
export function solarQuote(panels: number, suburb: string, onBinDay: boolean) {
  /* Every job from $179 (lib/quote.ts QUOTE_CONFIG.minTotal). */
  const subtotal = Math.max(Math.round(panels * SOLAR_RATE * 100) / 100, SOLAR_MIN);
  const zone = findCallout(suburb);
  const travel = zone ? (onBinDay ? 0 : travelLoading(subtotal, zone.loading)) : null;
  const total = travel != null ? Math.round((subtotal + travel) * 100) / 100 : null;
  return { subtotal, zone, travel, total };
}

/* What customers are told about the suburb adjustment. The percentages stay
   behind the scenes (Siezar, 19 Sept); the calculators fold them into the
   price once the suburb or address is known. /terms keeps the full detail. */
export const SUBURB_NOTE =
  "One price anywhere we cover, from Palm Cove to Gordonvale. No call-out fee, and the price shown for your address is the price you pay.";
