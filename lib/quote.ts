/* Instant satellite quote — geometry and pricing.
 *
 * Single source of truth for measured pricing. The map component imports it
 * to show a price; the Server Action imports it to recompute that price from
 * the raw coordinates. The browser is never trusted for a dollar figure.
 *
 * PRICING BASIS (2026 market rates, Queensland):
 *   - Roof cleaning in Brisbane/QLD runs $4.50–$10.50 per m², with a typical
 *     residential job at $650–$1,500 and Colorbond at the lower end.
 *   - A standard single/double driveway runs $150–$300 all in; concrete paths
 *     $60–$220; pool surrounds and paving $100–$380.
 *   - A full house exterior wash runs $250–$700.
 *   - Soft washing runs $50–$120/hr; general pressure cleaning $40–$100/hr.
 * The tiers below are set to land mid-band for a typical job — Cairns Bin
 * Cleaning is not competing on being cheapest. Every number is a starting
 * point Siezar adjusts once real job history says otherwise.
 *
 * Solar is the exception: $14.50 per panel is a real published price, so
 * measured area is converted to a panel count rather than charged per m².
 */

export type MeasureMode = "area" | "roof" | "walls" | "panels";

export type PriceTier = { upTo: number; rate: number };

export type QuoteService = {
  id: string;
  name: string;
  mode: MeasureMode;
  hint: string;
  /* Marginal tiers: the first `upTo` m² bill at `rate`, the next band at the
     next rate, and so on. Setup time is fixed, so big jobs genuinely cost
     less per m² — a flat rate quotes fantasy numbers on commercial work. */
  tiers: PriceTier[];
  /* Floor for this service. Below this the truck roll isn't worth it. */
  min: number;
  /* Production rate with current gear, used to estimate hours. Never shown
     to the customer — it exists so Siezar can see whether a quote clears his
     hourly target before he accepts the job. */
  m2PerHour: number;
};

export type LatLng = { lat: number; lng: number };

/* ---------------------------------------------------------------- config */

export const QUOTE_CONFIG = {
  /* Charged ONCE per quote no matter how many areas are measured — we're
     already on site. Matches calloutZones in lib/pricing.ts. */
  callOutFee: 50,

  /* Absolute floor; per-service minimums below are what normally bind. */
  minTotal: 50,

  /* House wash is priced on wall area: distance around × this × storeys. */
  wallHeightPerStorey: 2.7,

  /* Typical residential panel is about 1.95 m². Used to turn a traced array
     into a panel count at the real $14.50 rate. */
  solarPanelM2: 1.95,
  solarRatePerPanel: 14.5,

  /* Fixed on-site time per visit: unload, set up, pack down. */
  setupHours: 0.5,

  /* What the truck needs to earn per hour to be worth running. Private —
     never rendered to a customer, only attached to Siezar's notification. */
  targetHourlyRate: 110,

  /* Above either of these, stop quoting a bookable number and ask for a site
     visit. Handing a stranger an instant $4,000 price on work nobody has
     looked at is how you end up doing $4,000 of work for $2,000 of value. */
  autoQuoteCeiling: { total: 2500, singleAreaM2: 1200 },

  /* PLACEHOLDER discounts. The discount comes off the cleaning, never off the
     call-out — turning up is a real cost. */
  plans: [
    { id: "once", label: "One-off", discount: 0, blurb: "this time" },
    { id: "6m", label: "6-monthly", discount: 0.1, blurb: "save 10%" },
    { id: "12m", label: "Yearly", discount: 0.15, blurb: "save 15%" },
  ],

  /* Roof multiplier is 1/cos(pitch) — real geometry. A satellite only sees
     the footprint. */
  pitches: [
    { id: "flat", label: "Flat", deg: 5, desc: "Skillion, carport, patio roof" },
    { id: "low", label: "Low", deg: 15, desc: "Most Colorbond" },
    { id: "normal", label: "Normal", deg: 22, desc: "Standard tile roof" },
    { id: "steep", label: "Steep", deg: 32, desc: "Queenslander, gables" },
  ],

  serviceArea: {
    lat: -16.9203,
    lng: 145.771,
    radiusKm: 45,
    name: "Cairns & the northern beaches",
  },

  start: { lat: -16.9203, lng: 145.771, zoom: 12 },
  wideView: { lat: -16.78, lng: 145.64, zoom: 9 },
  workZoom: 20,
} as const;

export const QUOTE_SERVICES: QuoteService[] = [
  {
    id: "driveway",
    name: "Driveway & concrete",
    mode: "area",
    hint: "Trace the edge of the concrete.",
    // 50 m² double driveway → $190 + $50 = $240, mid the $150–300 market band.
    tiers: [
      { upTo: 60, rate: 3.8 },
      { upTo: 200, rate: 3.0 },
      { upTo: 600, rate: 2.4 },
      { upTo: Infinity, rate: 1.9 },
    ],
    min: 180,
    m2PerHour: 120,
  },
  {
    id: "patio",
    name: "Patio / pool surround",
    mode: "area",
    hint: "Trace around the pavers.",
    // Fiddlier than a driveway — edges, furniture, garden beds.
    tiers: [
      { upTo: 40, rate: 4.5 },
      { upTo: 120, rate: 3.6 },
      { upTo: Infinity, rate: 2.9 },
    ],
    min: 160,
    m2PerHour: 80,
  },
  {
    id: "roof",
    name: "Roof wash",
    mode: "roof",
    hint: "Trace the roof outline — we add the slope.",
    // 200 m² of roof → ~$1,095 all in. QLD band is $650–$1,500, average ~$950.
    tiers: [
      { upTo: 150, rate: 5.5 },
      { upTo: 400, rate: 4.4 },
      { upTo: Infinity, rate: 3.6 },
    ],
    min: 450,
    m2PerHour: 90,
  },
  {
    id: "house",
    name: "House wash",
    mode: "walls",
    hint: "Trace around the house — we price the walls, not the floor.",
    // Single storey, 48 m around → 130 m² of wall → ~$518. Band $250–$700.
    tiers: [
      { upTo: 150, rate: 3.6 },
      { upTo: 350, rate: 2.9 },
      { upTo: Infinity, rate: 2.3 },
    ],
    min: 320,
    m2PerHour: 70,
  },
  {
    id: "carpark",
    name: "Car park / commercial",
    mode: "area",
    hint: "Trace the bays and lanes.",
    // Open ground, bigger gear, real economies of scale.
    tiers: [
      { upTo: 500, rate: 2.2 },
      { upTo: 2000, rate: 1.7 },
      { upTo: Infinity, rate: 1.3 },
    ],
    min: 400,
    m2PerHour: 220,
  },
  {
    id: "solar",
    name: "Solar panels",
    mode: "panels",
    hint: "Trace the panel array, not the whole roof.",
    // Priced per panel at the real published rate; tiers unused.
    tiers: [{ upTo: Infinity, rate: 0 }],
    min: 150,
    m2PerHour: 50,
  },
];

export const getQuoteService = (id: string) => QUOTE_SERVICES.find((s) => s.id === id);

/* ------------------------------------------------------------- geometry */

const WGS84_A = 6378137;
const WGS84_E2 = 0.00669437999014;
const rad = (d: number) => (d * Math.PI) / 180;

/* Local WGS84 projection around the shape's own centroid. Accurate to better
   than 0.001% at block scale — checked against geographiclib. The spherical
   shortcut (what Google's own computeArea uses) reads ~0.5% high at Cairns'
   latitude, which is real money on a car park. */
export function projector(pts: LatLng[]) {
  const lat0 = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lng0 = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
  const s2 = Math.sin(rad(lat0)) ** 2;
  const M = (WGS84_A * (1 - WGS84_E2)) / Math.pow(1 - WGS84_E2 * s2, 1.5);
  const N = WGS84_A / Math.sqrt(1 - WGS84_E2 * s2);
  const cos0 = Math.cos(rad(lat0));
  return {
    fwd: (p: LatLng): [number, number] => [rad(p.lng - lng0) * N * cos0, rad(p.lat - lat0) * M],
    inv: ([x, y]: [number, number]): LatLng => ({
      lat: lat0 + ((y / M) * 180) / Math.PI,
      lng: lng0 + ((x / (N * cos0)) * 180) / Math.PI,
    }),
  };
}

export function polygonArea(pts: LatLng[]): number {
  if (pts.length < 3) return 0;
  const xy = pts.map(projector(pts).fwd);
  let s = 0;
  for (let i = 0; i < xy.length; i++) {
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[(i + 1) % xy.length];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s / 2);
}

export function edgeLengths(pts: LatLng[]): number[] {
  if (pts.length < 2) return [];
  const xy = pts.map(projector(pts).fwd);
  const n = xy.length;
  const segs = n < 3 ? n - 1 : n;
  const out: number[] = [];
  for (let i = 0; i < segs; i++) {
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[(i + 1) % n];
    out.push(Math.hypot(x2 - x1, y2 - y1));
  }
  return out;
}

export const perimeter = (pts: LatLng[]) => edgeLengths(pts).reduce((a, b) => a + b, 0);

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* Driveways, roofs and car parks are nearly all rectilinear. A corner tapped
   within a few degrees of square snaps exactly square — removes finger
   wobble without overriding a genuinely angled shape. */
export const SNAP_TOLERANCE_DEG = 11;

export function snapRightAngle(prev2: LatLng, prev1: LatLng, cand: LatLng): LatLng {
  const P = projector([prev2, prev1, cand]);
  const a = P.fwd(prev2);
  const b = P.fwd(prev1);
  const c = P.fwd(cand);
  const v1: [number, number] = [a[0] - b[0], a[1] - b[1]];
  const v2: [number, number] = [c[0] - b[0], c[1] - b[1]];
  const len1 = Math.hypot(v1[0], v1[1]);
  const len2 = Math.hypot(v2[0], v2[1]);
  if (len1 < 0.5 || len2 < 0.5) return cand;
  const dot = (v1[0] * v2[0] + v1[1] * v2[1]) / (len1 * len2);
  const ang = (Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI;
  if (Math.abs(ang - 90) > SNAP_TOLERANCE_DEG) return cand;
  const perp: [number, number] = [-v1[1] / len1, v1[0] / len1];
  const sign = perp[0] * v2[0] + perp[1] * v2[1] >= 0 ? 1 : -1;
  return P.inv([b[0] + perp[0] * sign * len2, b[1] + perp[1] * sign * len2]);
}

/* -------------------------------------------------------------- pricing */

export type QuoteShape = {
  service: string;
  pitchId?: string | null;
  storeys?: number | null;
  coords: [number, number][];
};

export type QuoteLine = QuoteShape & {
  label: string;
  mode: MeasureMode;
  area: number;
  perim: number;
  billable: number;      // m² charged (or panels, for solar)
  panels?: number;
  amount: number;
  hours: number;
};

/* What actually gets charged for, once the shape is understood. */
export function billableFor(input: {
  mode: MeasureMode;
  area: number;
  perim: number;
  pitchId?: string | null;
  storeys?: number | null;
}): number {
  if (input.mode === "roof") {
    const p = QUOTE_CONFIG.pitches.find((x) => x.id === input.pitchId) ?? QUOTE_CONFIG.pitches[2];
    return input.area / Math.cos(rad(p.deg));
  }
  if (input.mode === "walls") {
    return input.perim * QUOTE_CONFIG.wallHeightPerStorey * (input.storeys || 1);
  }
  return input.area;
}

/* Marginal tier pricing — each band charges its own rate for the metres
   inside it, so the price curve bends instead of stepping. */
export function tieredPrice(m2: number, tiers: PriceTier[]): number {
  let remaining = m2;
  let last = 0;
  let total = 0;
  for (const tier of tiers) {
    if (remaining <= 0) break;
    const band = Math.min(remaining, tier.upTo - last);
    total += band * tier.rate;
    remaining -= band;
    last = tier.upTo;
  }
  return total;
}

export function priceShape(shape: QuoteShape): QuoteLine | null {
  const service = getQuoteService(shape.service);
  if (!service) return null;
  if (!Array.isArray(shape.coords) || shape.coords.length < 3) return null;

  const pts: LatLng[] = shape.coords.map(([lat, lng]) => ({ lat, lng }));
  if (pts.some((p) => !Number.isFinite(p.lat) || !Number.isFinite(p.lng))) return null;

  const area = polygonArea(pts);
  const perim = perimeter(pts);

  if (service.mode === "panels") {
    const panels = Math.max(1, Math.round(area / QUOTE_CONFIG.solarPanelM2));
    const amount = Math.max(panels * QUOTE_CONFIG.solarRatePerPanel, service.min);
    return {
      ...shape,
      label: service.name,
      mode: service.mode,
      area: Math.round(area),
      perim: Math.round(perim),
      billable: panels,
      panels,
      amount: Math.round(amount),
      hours: panels / service.m2PerHour,
    };
  }

  const billable = Math.round(
    billableFor({ mode: service.mode, area, perim, pitchId: shape.pitchId, storeys: shape.storeys })
  );
  const amount = Math.round(Math.max(tieredPrice(billable, service.tiers), service.min));

  return {
    ...shape,
    label: service.name,
    mode: service.mode,
    area: Math.round(area),
    perim: Math.round(perim),
    billable,
    amount,
    hours: billable / service.m2PerHour,
  };
}

export function explainLine(line: QuoteLine): string {
  if (line.mode === "panels") return `${line.panels} panels × $${QUOTE_CONFIG.solarRatePerPanel}`;
  if (line.mode === "roof") {
    const p = QUOTE_CONFIG.pitches.find((x) => x.id === line.pitchId) ?? QUOTE_CONFIG.pitches[2];
    return `${line.area} m² footprint · ${p.label.toLowerCase()} ${p.deg}° → ${line.billable} m² of roof`;
  }
  if (line.mode === "walls") {
    const n = line.storeys || 1;
    return `${line.perim} m around × ${QUOTE_CONFIG.wallHeightPerStorey} m × ${n} storey${n > 1 ? "s" : ""} → ${line.billable} m²`;
  }
  return `${line.billable} m²`;
}

export type QuoteTotals = {
  work: number;
  callout: number;
  saving: number;
  grand: number;
  plan: (typeof QUOTE_CONFIG.plans)[number];
  /* Private to Siezar — never rendered on the customer's screen. */
  hours: number;
  effectiveHourly: number;
  belowTarget: boolean;
  /* True when the job is too big to hand a stranger an instant price. */
  needsSiteVisit: boolean;
  siteVisitReason: string | null;
};

export function quoteTotals(lines: QuoteLine[], planId: string): QuoteTotals {
  const plan = QUOTE_CONFIG.plans.find((p) => p.id === planId) ?? QUOTE_CONFIG.plans[0];
  const work = lines.reduce((n, l) => n + l.amount, 0);
  const callout = lines.length ? QUOTE_CONFIG.callOutFee : 0;
  const saving = Math.round(work * plan.discount);
  const grand = lines.length ? Math.max(work - saving + callout, QUOTE_CONFIG.minTotal) : 0;

  const hours = lines.reduce((n, l) => n + l.hours, 0) + (lines.length ? QUOTE_CONFIG.setupHours : 0);
  const effectiveHourly = hours > 0 ? grand / hours : 0;

  const bigArea = lines.find((l) => l.billable > QUOTE_CONFIG.autoQuoteCeiling.singleAreaM2);
  const needsSiteVisit =
    grand > QUOTE_CONFIG.autoQuoteCeiling.total ||
    Boolean(bigArea) ||
    lines.some((l) => (l.storeys || 1) >= 3);

  const siteVisitReason = !needsSiteVisit
    ? null
    : bigArea
      ? `${bigArea.label} is ${bigArea.billable} m² — worth walking before anyone commits`
      : lines.some((l) => (l.storeys || 1) >= 3)
        ? "three storeys means access gear, and that gets looked at first"
        : "a job this size gets measured on site before we lock a price";

  return {
    work,
    callout,
    saving,
    grand,
    plan,
    hours: Math.round(hours * 10) / 10,
    effectiveHourly: Math.round(effectiveHourly),
    belowTarget: hours > 0 && effectiveHourly < QUOTE_CONFIG.targetHourlyRate,
    needsSiteVisit,
    siteVisitReason,
  };
}

export const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");

/* Friendly scale so 465 m² means something to someone who has never
   measured a driveway. */
export function scaleComparison(m2: number): string {
  if (m2 <= 0) return "";
  const CAR_SPACE = 12.96;
  const TENNIS_COURT = 260.87;
  if (m2 < 60) return `about ${(m2 / CAR_SPACE).toFixed(1)} car spaces`;
  if (m2 < 900) return `about ${(m2 / TENNIS_COURT).toFixed(1)} tennis courts`;
  return `about ${Math.round(m2 / TENNIS_COURT)} tennis courts`;
}
