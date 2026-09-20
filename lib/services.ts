import { GUTTER, QUOTE_CONFIG, ROOF_MATERIALS, WINDOW_RATES } from "./quote";

/* Price copy built from lib/quote.ts, so the words can't drift from the
   numbers the quote tool actually charges. */
const $ = (n: number) => `$${n % 1 ? n.toFixed(2) : n}`;
const MIN = $(QUOTE_CONFIG.minTotal);
const [METAL, TILE] = ROOF_MATERIALS;
const INHIBIT = $(QUOTE_CONFIG.inhibitorPerM2);
// Single source of truth for every service on the site.
// One shape, used by the homepage list, the service pages, the prices page
// and page metadata — so there is only ever one place to update a price,
// a photo or a sentence of copy.

export type ServicePhoto = {
  src: string; // lives in /public/media
  alt: string; // what the photo actually shows — written for a screen reader first
  caption: string; // the line printed under the photo
  role: "before" | "after" | "split" | "action";
  suburb: string; // real FNQ suburb the job was in
  lat: number;
  lon: number;
  width: number;
  height: number;
  pair?: string; // set on a before/after shot ONLY when both frames are the same job
};

export type Service = {
  slug: string;
  name: string;
  tone: string; // used for the homepage’s per-service colour/atmosphere shift
  media: string; // hero/preview photo, lives in /public/media

  // Homepage list + sticky preview (HomeExperience.tsx)
  cue: string; // short hook shown in the preview panel
  short: string; // one-line description
  price: string; // short price label for the homepage + prices page

  // Service page (ServicePageClient.tsx)
  eyebrow: string;
  keyword: string; // "[service] Cairns", shown as the first line of the H1
  heading: string;
  intro: string;
  priceModel: string;
  priceDetail: string;
  mediaCaption: string; // honest one-line caption for the real photo
  gallery: ServicePhoto[]; // proof shots, geotagged to the suburb the job was in
  seoHeading: string;
  seoParagraphs: string[];
  related: string[];

  // Page <title> / meta description (app/[slug]/page.tsx generateMetadata)
  seoTitle: string;
  seoDescription: string;
};

export const services: Service[] = [
  {
    slug: "pressure-cleaning",
    name: "Pressure Cleaning",
    tone: "concrete",
    media: "/media/driveway-mid-clean-split-line-edmonton.jpg",
    cue: "Concrete gone black?",
    short: "Driveways, paths, pool surrounds and hard surfaces.",
    price: "From $2.95/m²",
    eyebrow: "PRESSURE CLEANING",
    keyword: "Pressure Cleaning Cairns", // leads the page H1: what people type into Google
    heading: "Got a driveway that’s gone black?",
    intro:
      "Tell us where it is and roughly how much needs cleaning. We’ll show you how the price is built before you book.",
    priceModel: "One price for the job",
    priceDetail:
      `Driveways and concrete $2.95/m² ($2.45 past 200 m²), patios and pool surrounds $3.45/m². Every job from ${MIN}. Mould inhibitor ${INHIBIT}/m² extra if you want it. Measure it on the map for the exact price.`,
    mediaCaption: "Same driveway, same pass. The line is where we stopped for the photo.",
    gallery: [
      {
        src: "/media/driveway-mid-clean-split-line-edmonton.jpg",
        alt: "Concrete driveway in Edmonton half pressure cleaned, dirty and clean sections side by side",
        caption: "Same driveway, same pass. The line is where we stopped for the photo.",
        role: "split",
        suburb: "Edmonton",
        lat: -17.0164,
        lon: 145.7375,
        width: 1200,
        height: 1600,
      },
      {
        src: "/media/driveway-before-staining-bentley-park.jpg",
        alt: "Stained concrete driveway in Bentley Park before pressure cleaning, work ute parked on it",
        caption: "Before: years of organic staining on a Bentley Park driveway.",
        role: "before",
        suburb: "Bentley Park",
        lat: -17.0011,
        lon: 145.7331,
        width: 1200,
        height: 1600,
      },
      {
        src: "/media/surface-cleaner-in-action-redlynch.jpg",
        alt: "Operator running a rotary surface cleaner across a Redlynch driveway, work ute in the background",
        caption: "Rotary surface cleaner. Even pass, no wand stripes.",
        role: "action",
        suburb: "Redlynch",
        lat: -16.8836,
        lon: 145.6986,
        width: 1600,
        height: 1200,
      },
      {
        src: "/media/driveway-clean-carport-mooroobool.jpg",
        alt: "Clean driveway and carport in Mooroobool after pressure cleaning, work ute and ladder on site",
        caption: "Mooroobool driveway, finished and still wet.",
        role: "after",
        suburb: "Mooroobool",
        lat: -16.9339,
        lon: 145.7292,
        width: 1600,
        height: 1200,
      },
      {
        src: "/media/pool-surround-concrete-trinity-beach.jpg",
        alt: "Cleaned concrete pool surround at a Trinity Beach property",
        caption: "Pool surround, cleaned and drying off.",
        role: "after",
        suburb: "Trinity Beach",
        lat: -16.7889,
        lon: 145.6975,
        width: 1200,
        height: 1600,
      },
    ],
    seoHeading: "Pressure cleaning built around Cairns concrete",
    seoParagraphs: [
      "Cairns concrete copes with a lot — heat, heavy rain, shade and the organic growth that comes with all three. Pressure cleaning lifts what’s built up without smashing the surface itself, which matters on older or softer concrete.",
      "We scope the job by area and access, not by guesswork. If a surface needs a gentler pass or a pre-treatment first, we’ll say so before we start, not after.",
      "Searching for pressure washing near me in Cairns? Pressure washing and pressure cleaning are the same job here — we’re a local crew, not a lead-gen middleman, so the person who quotes it is the person who does it.",
      `Driveway cleaning, concrete cleaning, paths, patios and pool surrounds: whether you call it pressure washing, high-pressure cleaning or jet washing, it’s the same job. We work across Cairns central, the Northern Beaches from Machans Beach to Ellis Beach, and the southside through to Gordonvale. Same price in every suburb, with no call-out fee.`,
    ],
    related: ["house-washing", "roof-cleaning", "commercial-cleaning"],
    seoTitle: "Pressure Cleaning Cairns | Driveways from $2.95/m²",
    seoDescription:
      "Pressure washing and pressure cleaning in Cairns for driveways, concrete, paths and exterior hard surfaces. Local crew, transparent pricing.",
  },
  {
    slug: "roof-cleaning",
    name: "Roof Cleaning",
    tone: "roof",
    media: "/media/roof-mid-clean-split-line-whitfield.jpg",
    cue: "Roof getting green?",
    short: "Tropical build-up, mould and exterior roof cleaning.",
    price: `Metal ${$(METAL.rate)}/m², tile ${$(TILE.rate)}/m²`,
    eyebrow: "ROOF CLEANING",
    keyword: "Roof Cleaning Cairns", // leads the page H1: what people type into Google
    heading: "The roof is doing the hard work. Look after it.",
    intro:
      "Cairns roofs cop heat, rain, shade and organic growth. We’ll price the job around the roof, access and what’s actually on it.",
    priceModel: "One price for the roof",
    priceDetail:
      `Soft wash. Metal roofs ${$(METAL.rate)}/m² (from ${$(METAL.min)}), tile ${$(TILE.rate)}/m² (from ${$(TILE.min)}), on the real roof area with the slope added. We don’t clean asbestos or fibro roofs.`,
    mediaCaption: "Mid-pass on a Whitfield roof. Left untouched, right done.",
    gallery: [
      {
        src: "/media/roof-mid-clean-split-line-whitfield.jpg",
        alt: "Colorbond roof in Whitfield part way through cleaning, rust-stained sheets beside freshly cleaned ones",
        caption: "Mid-pass on a Whitfield roof. Left untouched, right done.",
        role: "split",
        suburb: "Whitfield",
        lat: -16.9042,
        lon: 145.7317,
        width: 900,
        height: 1600,
      },
      {
        src: "/media/roof-rust-streaks-before-manunda.jpg",
        alt: "Heavily rust-streaked Colorbond roof sheets in Manunda before cleaning",
        caption: "Wet-season staining right across the sheets.",
        role: "before",
        suburb: "Manunda",
        lat: -16.9153,
        lon: 145.7461,
        width: 1200,
        height: 1600,
      },
      {
        src: "/media/roof-cleaned-shed-profile-edge-hill.jpg",
        alt: "Cleaned white metal roof on an Edge Hill building",
        caption: "Edge Hill roof, cleaned back to the coating.",
        role: "after",
        suburb: "Edge Hill",
        lat: -16.9033,
        lon: 145.7492,
        width: 1600,
        height: 1200,
      },
      {
        src: "/media/roof-cleaned-ridge-ranges-gordonvale.jpg",
        alt: "Cleaned metal roof ridge in Gordonvale with the ranges behind it",
        caption: "Gordonvale roofline, finished.",
        role: "after",
        suburb: "Gordonvale",
        lat: -17.0958,
        lon: 145.7861,
        width: 1600,
        height: 1200,
      },
      {
        src: "/media/roof-surface-cleaner-on-sheets-kanimbla.jpg",
        alt: "Roof surface cleaner sitting on rust-marked roof sheets in Kanimbla mid job",
        caption: "Low pressure, wide pass. Roofs never get a turbo nozzle.",
        role: "action",
        suburb: "Kanimbla",
        lat: -16.9,
        lon: 145.7181,
        width: 1200,
        height: 1600,
      },
    ],
    seoHeading: "Roof cleaning for Far North Queensland conditions",
    seoParagraphs: [
      "Wet season doesn’t take a break, and neither does the mould, algae and organic staining it leaves on a Cairns roof. Left long enough it holds moisture against the roof sheeting itself.",
      "Access and pitch decide most of the job. We’ll always tell you plainly if something’s outside what we can safely do rather than take a risk we’re not equipped for.",
      "Looking for roof cleaning near me in Cairns? We quote it and we climb it — no subcontractor, no middleman marking up the job.",
      `Roof cleaning, roof mould removal and roof soft washing across Cairns: from Palm Cove and Trinity Beach through Edge Hill and Whitfield and out to Gordonvale. The price is built on the roof itself. Same price in every suburb, with no call-out fee.`,
    ],
    related: ["solar-panel-cleaning", "gutter-cleaning", "house-washing"],
    seoTitle: "Roof Cleaning Cairns | Soft Wash from $3.95/m²",
    seoDescription:
      "Roof soft washing in Cairns for mould, lichen and tropical build-up. Metal $3.95/m², tile $4.95/m². Measure your roof online for an instant price.",
  },
  {
    slug: "bin-cleaning",
    name: "Bin Cleaning",
    tone: "bin",
    media: "/media/IMG_3227.jpg",
    cue: "Bins starting to smell?",
    short: "Residential and commercial bin cleaning in Cairns.",
    price: "From $35.95 recurring",
    eyebrow: "CAIRNS BIN CLEANING",
    keyword: "Bin Cleaning Cairns", // leads the page H1: what people type into Google
    heading: "Bins are our thing.",
    intro:
      "Pick how often you want them cleaned. Same price in every suburb.",
    priceModel: "One fixed price",
    priceDetail:
      "Two standard 240L bins: $35.95 fortnightly, $39.95 every four weeks, or $74.95 one-off. Recurring plans run on a 3-service minimum.",
    mediaCaption: "Commercial bin bay in Cairns, bins wheeled out for cleaning.",
    gallery: [
      {
        src: "/media/bin-interior-before-woree.jpg",
        alt: "Interior of two wheelie bins in Woree before cleaning, showing built-up residue and rubbish",
        caption: "Before: what a Cairns wet season does to the inside of a bin.",
        role: "before",
        suburb: "Woree",
        lat: -16.9553,
        lon: 145.7411,
        width: 1200,
        height: 1600,
        pair: "woree-bins",
      },
      {
        src: "/media/bin-interior-after-woree.jpg",
        alt: "Interior of the same two Woree wheelie bins after cleaning, green plastic clean and clear",
        caption: "After: same two bins, same visit.",
        role: "after",
        suburb: "Woree",
        lat: -16.9553,
        lon: 145.7411,
        width: 1200,
        height: 1600,
        pair: "woree-bins",
      },
      {
        src: "/media/kerbside-bins-before-mount-sheridan.jpg",
        alt: "Yellow and green kerbside wheelie bins in Mount Sheridan with a stained yellow lid before cleaning",
        caption: "Before: the lid is where it always shows first.",
        role: "before",
        suburb: "Mount Sheridan",
        lat: -16.9878,
        lon: 145.7369,
        width: 1600,
        height: 1200,
        pair: "sheridan-bins",
      },
      {
        src: "/media/kerbside-bins-after-mount-sheridan.jpg",
        alt: "The same Mount Sheridan yellow and green wheelie bins after cleaning, lids clean, back on the grass",
        caption: "After: back on the verge before collection day.",
        role: "after",
        suburb: "Mount Sheridan",
        lat: -16.9878,
        lon: 145.7369,
        width: 1600,
        height: 1200,
        pair: "sheridan-bins",
      },
      {
        src: "/media/commercial-bin-fleet-rows-earlville.jpg",
        alt: "Rows of cleaned red-lid and green wheelie bins lined up at an Earlville commercial site",
        caption: "A full site's worth of bins, done in one visit.",
        role: "after",
        suburb: "Earlville",
        lat: -16.9411,
        lon: 145.7317,
        width: 1600,
        height: 1200,
      },
    ],
    seoHeading: "Why Cairns bin cleaning matters more in the wet",
    seoParagraphs: [
      "Heat and humidity turn a dirty bin into a smell and a hygiene problem fast — the reason bin cleaning is its own business here, not an add-on.",
      "Every wash uses a hydraulic tip and a four-stage filtration system before the water goes back into the tank for the next clean. That process is specific to bin cleaning — it isn’t how our other services handle wastewater.",
      "Searching for bin cleaning near me or wheelie bin cleaning in Cairns? We clean household 240L bins fortnightly, every four weeks or as a one-off, across Cairns central, the Northern Beaches and the southside through to Gordonvale. Bin cleaning has nothing added for your suburb, wherever you are.",
    ],
    related: ["pressure-cleaning", "commercial-cleaning"],
    seoTitle: "Bin Cleaning Cairns | Wheelie Bins from $35.95",
    seoDescription:
      "Wheelie bin cleaning in Cairns: $35.95 fortnightly, $39.95 every four weeks or $74.95 one-off. Water filtered and recycled. Book online in a minute.",
  },
  {
    slug: "window-cleaning",
    name: "Window Cleaning",
    tone: "glass",
    media: "/media/IMG_2935.jpg",
    cue: "Glass lost its shine?",
    short: "Exterior glass and presentation cleaning.",
    price: `From ${$(WINDOW_RATES.outside)} a pane`,
    eyebrow: "WINDOW CLEANING",
    keyword: "Window Cleaning Cairns", // leads the page H1: what people type into Google
    heading: "You notice clean glass when you stop noticing the glass.",
    intro:
      "Tell us the property and what you need cleaned. We’ll keep the scope and the price easy to understand.",
    priceModel: "One price for the windows",
    priceDetail:
      `${$(WINDOW_RATES.outside)} a pane outside only, ${$(WINDOW_RATES.both)} inside and out. Every job from ${MIN}.`,
    mediaCaption: "Glazed walkway on a Cairns strata building.",
    // TODO: no confirmed Cairns Bin Cleaning photo of this service exists yet.
    // Left empty on purpose rather than filled with a stock image.
    // Shoot needed: a gloved hand pulling leaf litter out of a gutter, and a
    // squeegee on a pane for window cleaning. Then add them here.
    gallery: [],
    seoHeading: "Window cleaning for salt air, dust and wet-season spotting",
    seoParagraphs: [
      "Coastal air, road dust and wet-season rain all leave their mark on glass differently — streaking, spotting or a dull film that regular rain doesn’t shift on its own.",
      "We clean the glass you can see from the street and the glass you actually look through — the difference matters more than people expect.",
      "If you’re searching for window cleaning near me in Cairns, we handle the booking, the quote and the job ourselves — no call centre and no subcontractor in between.",
      `Window washing and glass cleaning for Cairns homes and businesses, from Palm Cove to Gordonvale. The price is built on how many windows, how high they are and how easy they are to reach. Same price in every suburb, with no call-out fee.`,
    ],
    related: ["house-washing", "solar-panel-cleaning"],
    seoTitle: "Window Cleaning Cairns | From $9.95 a Pane",
    seoDescription:
      "Window cleaning in Cairns from $9.95 a pane outside or $14.95 inside and out. Count your panes online for an instant price. No call-out fee.",
  },
  {
    slug: "solar-panel-cleaning",
    name: "Solar Panels",
    tone: "solar",
    media: "/media/solar-clean-harnessed-on-roof-brinsmead.jpg",
    cue: "Panels looking dusty?",
    short: "Flat $14.50 a panel, any roof, any suburb.",
    price: "From $14.50 per panel",
    eyebrow: "SOLAR PANEL CLEANING",
    keyword: "Solar Panel Cleaning Cairns", // leads the page H1: what people type into Google
    heading: "Count the panels. We’ll do the rest.",
    intro:
      "$14.50 per panel, the same in every suburb. Enter your suburb and panel count below and your price is there. Already a bin customer? We can do it on your bin-clean day.",
    priceModel: "$14.50 a panel, simple as that",
    priceDetail:
      "$14.50 per panel, no matter the roof shape or the suburb, jobs from $179. No call-out fee.",
    mediaCaption: "Harnessed up, soft brush, nobody standing on the panels.",
    gallery: [
      {
        src: "/media/solar-clean-harnessed-on-roof-brinsmead.jpg",
        alt: "Operator in a safety harness brushing solar panels on a Brinsmead roof",
        caption: "Harnessed up, soft brush, nobody standing on the panels.",
        role: "action",
        suburb: "Brinsmead",
        lat: -16.9131,
        lon: 145.7139,
        width: 1296,
        height: 972,
      },
      {
        src: "/media/solar-array-roof-street-view-bayview-heights.jpg",
        alt: "Solar array on a Bayview Heights roof after cleaning, looking out over the street",
        caption: "Bayview Heights array, cleaned.",
        role: "after",
        suburb: "Bayview Heights",
        lat: -16.9678,
        lon: 145.7264,
        width: 1600,
        height: 1200,
      },
      {
        src: "/media/solar-array-with-ranges-freshwater.jpg",
        alt: "Cleaned solar panels on a Freshwater house roof with the ranges behind",
        caption: "Freshwater install. Panels and roof done in the same visit.",
        role: "after",
        suburb: "Freshwater",
        lat: -16.8869,
        lon: 145.6939,
        width: 1600,
        height: 1200,
      },
    ],
    seoHeading: "Solar panel cleaning and why output actually drops",
    seoParagraphs: [
      "Dust, pollen and the film that builds up in the wet season all cut into how much a panel actually generates — often more than people expect for something that looks only lightly dusty.",
      "Pricing is deliberately simple: a flat rate per panel, plus what it costs us to get to your suburb. No package tiers to decode.",
      "Searching for solar panel cleaning near me in Cairns? Same crew, same flat per-panel rate — no franchise call centre routing the job to whoever’s available.",
      "Solar panel washing for homes from Ellis Beach to Gordonvale: the same $14.50 a panel whatever the roof, and less on your bin-clean day. Count your panels, enter your suburb on this page and the total is there before you book.",
    ],
    related: ["roof-cleaning", "gutter-cleaning", "window-cleaning"],
    seoTitle: "Solar Panel Cleaning Cairns | From $14.50 Per Panel",
    seoDescription:
      "Solar panel cleaning in Cairns. $14.50 per panel, nothing added on your bin-clean day. Harnessed, soft brush, no standing on panels.",
  },
  {
    slug: "house-washing",
    name: "House Washing",
    tone: "house",
    media: "/media/house-wash-action-lance-smithfield.jpg",
    cue: "Walls looking tropical?",
    short: "Exterior house washing suited to Cairns conditions.",
    price: "From $429",
    eyebrow: "HOUSE WASHING",
    keyword: "House Washing Cairns", // leads the page H1: what people type into Google
    heading: "The whole place needs a freshen-up?",
    intro:
      "Start with the suburb and property. We’ll work out what surfaces actually need attention and keep the quote clear.",
    priceModel: "One price for the house",
    priceDetail:
      "Soft wash, priced on wall area: $3.30/m² ($2.40 past 150 m²). A single-storey house starts at $429; double storey is usually $650 to $800.",
    mediaCaption: "Low pressure on render. Lifts the growth without stripping paint.",
    gallery: [
      {
        src: "/media/house-wash-action-lance-smithfield.jpg",
        alt: "Operator washing a rendered wall and garage door at a Smithfield home with a low-pressure lance",
        caption: "Low pressure on render. Lifts the growth without stripping paint.",
        role: "action",
        suburb: "Smithfield",
        lat: -16.8281,
        lon: 145.6889,
        width: 1600,
        height: 1200,
      },
      {
        src: "/media/clad-wall-after-soft-wash-gordonvale.jpg",
        alt: "Long cleaned clad wall of a Gordonvale building after soft washing",
        caption: "Clad wall, soft washed end to end.",
        role: "after",
        suburb: "Gordonvale",
        lat: -17.0958,
        lon: 145.7861,
        width: 1600,
        height: 1200,
      },
      {
        src: "/media/clad-wall-detail-edmonton.jpg",
        alt: "Close view of cleaned corrugated cladding on an Edmonton building",
        caption: "Cladding detail. No pressure marks in the profile.",
        role: "after",
        suburb: "Edmonton",
        lat: -17.0164,
        lon: 145.7375,
        width: 1600,
        height: 1200,
      },
    ],
    seoHeading: "House washing for tropical grime and mould",
    seoParagraphs: [
      "Render, cladding and weatherboard all pick up mould and algae differently in a Cairns wet season — what works on one surface can be too harsh for another.",
      "That's why house washing here is a Soft Washing job, not a pressure job: a low-pressure chemical treatment that lifts mould and algae off the surface instead of blasting it — and the paint — off the wall.",
      "We match the method to the surface rather than running one setting on every wall.",
      "Searching for house washing near me or exterior house cleaning in Cairns? Same job, same local crew — the person who quotes it is the person who shows up and does it.",
      `Exterior house washing, soft washing and mould removal for render, cladding and weatherboard homes across Cairns central, the Northern Beaches and the southside through to Gordonvale. Same price in every suburb, with no call-out fee.`,
    ],
    related: ["window-cleaning", "roof-cleaning", "pressure-cleaning"],
    seoTitle: "House Washing Cairns | Soft Wash from $429",
    seoDescription:
      "House washing in Cairns: a soft wash for mould and tropical grime, priced on wall area from $429. Measure your house online for an instant price.",
  },
  {
    slug: "gutter-cleaning",
    name: "Gutter Cleaning",
    tone: "gutter",
    media: "/media/roof-surface-cleaner-on-sheets-kanimbla.jpg",
    cue: "Wet season ready?",
    short: "Gutters, edges and exterior maintenance.",
    price: `${$(GUTTER.base[1])} single, ${$(GUTTER.base[2])} double`,
    eyebrow: "GUTTER CLEANING",
    keyword: "Gutter Cleaning Cairns", // leads the page H1: what people type into Google
    heading: "Keep the wet-season water moving.",
    intro:
      "Single or double storey, and how much gutter there is. That decides the price, and you can see it on the map below.",
    priceModel: "One price for the gutters",
    priceDetail:
      `${$(GUTTER.base[1])} single storey or ${$(GUTTER.base[2])} double for the first ${GUTTER.includedM} m of gutter, then ${$(GUTTER.perExtraM)} a metre. Downpipes flushed, included.`,
    mediaCaption: "Roofline on a Kanimbla job. Gutters get cleared before the roof is washed.",
    // TODO: no confirmed Cairns Bin Cleaning photo of this service exists yet.
    // Left empty on purpose rather than filled with a stock image.
    // Shoot needed: a gloved hand pulling leaf litter out of a gutter, and a
    // squeegee on a pane for window cleaning. Then add them here.
    gallery: [],
    seoHeading: "Gutter cleaning before the wet season hits",
    seoParagraphs: [
      "Blocked gutters in a Cairns downpour don’t just overflow — they push water somewhere it isn’t supposed to go, close to the roofline or the foundations.",
      "Best done before the wet season builds, not after the first big storm finds the blockage for you.",
      "If you’re after gutter cleaning near me in Cairns, that’s us — a local crew, not a lead-gen number that passes your details on to whoever’s cheapest that week.",
      `We clear gutters with a gutter vacuum system, so the leaf litter and muck come out through the hose and into the machine. Gutter cleaning is available across Cairns central, the Northern Beaches and the southside through to Gordonvale. Same price in every suburb, with no call-out fee.`,
    ],
    related: ["roof-cleaning", "solar-panel-cleaning", "house-washing"],
    seoTitle: "Gutter Cleaning Cairns | From $199, Downpipes Flushed",
    seoDescription:
      "Gutter cleaning in Cairns: $199 single storey or $299 double for the first 45 m, downpipes flushed. Instant price online and no call-out fee.",
  },
  {
    slug: "commercial-cleaning",
    name: "Commercial",
    tone: "commercial",
    media: "/media/commercial-carpark-rotary-cairns-city.jpg",
    cue: "Site needs sorting?",
    short: "Commercial, strata, body corporate and property work.",
    price: "Site-specific",
    eyebrow: "COMMERCIAL & GOVERNMENT",
    keyword: "Commercial Cleaning Cairns", // leads the page H1: what people type into Google
    heading: "Need the site looked after without chasing the contractor?",
    intro:
      "Tell us the site and what needs cleaning. Straightforward scope, scheduling and site visits for larger work. We carry $20,000,000 in public liability cover, so procurement sign-off isn’t held up waiting on paperwork.",
    priceModel: "One price for the site",
    priceDetail:
      "Smaller jobs get one straightforward price, same as the rest of the site. Larger or recurring sites get a proper scope and, usually, a site visit rather than a number guessed over the phone.",
    mediaCaption: "Carpark ramp, cleaned in sections around traffic.",
    gallery: [
      {
        src: "/media/commercial-carpark-rotary-cairns-city.jpg",
        alt: "Operator running a rotary surface cleaner across a commercial carpark ramp in Cairns City",
        caption: "Carpark ramp, cleaned in sections around traffic.",
        role: "action",
        suburb: "Cairns City",
        lat: -16.9186,
        lon: 145.7781,
        width: 1200,
        height: 1600,
      },
      {
        src: "/media/commercial-frontage-collins-ave-cairns-city.jpg",
        alt: "Cleaned footpath and frontage at a Collins Avenue commercial property in Edge Hill, Cairns",
        caption: "Collins Avenue, Edge Hill. Frontage done before opening.",
        role: "after",
        suburb: "Edge Hill",
        lat: -16.8998,
        lon: 145.7448,
        width: 1600,
        height: 1200,
      },
      {
        src: "/media/strata-refuse-room-cairns-city.jpg",
        alt: "Wheelie bins lined up in a strata refuse room in Cairns City ready for cleaning",
        caption: "Strata refuse room. Bins cleaned in place, no carting them out.",
        role: "before",
        suburb: "Cairns City",
        lat: -16.9186,
        lon: 145.7781,
        width: 1296,
        height: 972,
      },
      {
        src: "/media/commercial-bin-fleet-rows-earlville.jpg",
        alt: "Rows of cleaned red-lid and green wheelie bins lined up at an Earlville commercial site",
        caption: "A full site's worth of bins, done in one visit.",
        role: "after",
        suburb: "Earlville",
        lat: -16.9411,
        lon: 145.7317,
        width: 1600,
        height: 1200,
      },
      {
        src: "/media/commercial-bulk-bins-portsmith.jpg",
        alt: "Large green bulk bins cleaned and lined up at a Portsmith commercial site",
        caption: "Bulk bins get the same process as a domestic 240L.",
        role: "after",
        suburb: "Portsmith",
        lat: -16.9414,
        lon: 145.7719,
        width: 1200,
        height: 1600,
      },
    ],
    seoHeading: "Commercial exterior maintenance across Cairns and FNQ",
    seoParagraphs: [
      "Cairns Bin Cleaning carries $20,000,000 in public liability insurance and current WorkCover cover, available on request for procurement and site induction.",
      "Strata, body corporate, hospitality and retail sites all need the exterior looked after around occupancy, not in spite of it — before opening, after hours, or scheduled around guest movement.",
      "The goal is recurring, documented maintenance rather than a one-off clean that starts the clock over again the day the next wet season hits.",
      "Commercial pressure washing, building washing and exterior cleaning for strata, retail, hospitality and government sites across Cairns and Far North Queensland: car parks, walkways, bin enclosures, building facades and hard surfaces.",
    ],
    related: ["pressure-cleaning", "bin-cleaning", "roof-cleaning"],
    seoTitle: "Commercial Pressure Cleaning Cairns | Strata & Sites",
    seoDescription:
      "Commercial pressure cleaning in Cairns for car parks, bin rooms, shopfronts and strata. $20M insured, SWMS supplied, site walkthrough and written quote.",
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
