// Single source of truth for every service on the site.
// One shape, used by the homepage list, the service pages, the prices page
// and page metadata — so there is only ever one place to update a price,
// a photo or a sentence of copy.

export type Service = {
  slug: string;
  name: string;
  tone: string; // used for the homepage's per-service colour/atmosphere shift
  media: string; // hero/preview photo, lives in /public/media

  // Homepage list + sticky preview (HomeExperience.tsx)
  cue: string; // short hook shown in the preview panel
  short: string; // one-line description
  price: string; // short price label for the homepage + prices page

  // Service page (ServicePageClient.tsx)
  eyebrow: string;
  heading: string;
  intro: string;
  priceModel: string;
  priceDetail: string;
  mediaCaption: string; // honest one-line caption for the real photo
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
    media: "/media/IMG_3027.jpg",
    cue: "Concrete gone black?",
    short: "Driveways, paths, pool surrounds and hard surfaces.",
    price: "Job price + call-out",
    eyebrow: "PRESSURE CLEANING",
    heading: "Got a driveway that's gone black?",
    intro:
      "Tell us where it is and roughly how much needs cleaning. We'll show you how the price is built before you book.",
    priceModel: "Call-out + job price",
    priceDetail:
      "Call-out for your suburb, plus the price for the area actually cleaned. No hidden extras.",
    mediaCaption: "Real Cairns driveway, mid pressure clean.",
    seoHeading: "Pressure cleaning built around Cairns concrete",
    seoParagraphs: [
      "Cairns concrete copes with a lot — heat, heavy rain, shade and the organic growth that comes with all three. Pressure cleaning lifts what's built up without smashing the surface itself, which matters on older or softer concrete.",
      "We scope the job by area and access, not by guesswork. If a surface needs a gentler pass or a pre-treatment first, we'll say so before we start, not after.",
    ],
    related: ["house-washing", "roof-cleaning", "commercial-cleaning"],
    seoTitle: "Pressure Cleaning Cairns | Driveways & Concrete",
    seoDescription:
      "Pressure cleaning in Cairns for driveways, concrete, paths and exterior hard surfaces.",
  },
  {
    slug: "roof-cleaning",
    name: "Roof Cleaning",
    tone: "roof",
    media: "/media/IMG_3156.jpg",
    cue: "Roof getting green?",
    short: "Tropical build-up, mould and exterior roof cleaning.",
    price: "Area/access estimate + call-out",
    eyebrow: "ROOF CLEANING",
    heading: "The roof is doing the hard work. Look after it.",
    intro:
      "Cairns roofs cop heat, rain, shade and organic growth. We'll price the job around the roof, access and what's actually on it.",
    priceModel: "Call-out + roof job price",
    priceDetail:
      "Priced on roof size, pitch, access and how much needs to come off. We'll walk you through it before quoting a figure.",
    mediaCaption: "Real Cairns roof, tropical growth visible on the ridge line.",
    seoHeading: "Roof cleaning for Far North Queensland conditions",
    seoParagraphs: [
      "Wet season doesn't take a break, and neither does the mould, algae and organic staining it leaves on a Cairns roof. Left long enough it holds moisture against the roof sheeting itself.",
      "Access and pitch decide most of the job. We'll always tell you plainly if something's outside what we can safely do rather than take a risk we're not equipped for.",
    ],
    related: ["solar-panel-cleaning", "gutter-cleaning", "house-washing"],
    seoTitle: "Roof Cleaning Cairns | Tropical Roof Maintenance",
    seoDescription:
      "Roof cleaning in Cairns for homes and properties affected by tropical mould, algae and grime.",
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
    heading: "Bins are our thing.",
    intro:
      "Pick how often you want them cleaned. No call-out fee on bin cleaning — it's the one service priced completely on its own.",
    priceModel: "Fixed price · no call-out",
    priceDetail:
      "Two standard 240L bins: $35.95 fortnightly, $39.95 every four weeks, or $74.95 one-off. Recurring plans run on a 3-service minimum.",
    mediaCaption: "Real Cairns bin clean, mid wash.",
    seoHeading: "Why Cairns bin cleaning matters more in the wet",
    seoParagraphs: [
      "Heat and humidity turn a dirty bin into a smell and a hygiene problem fast — the reason bin cleaning is its own business here, not an add-on.",
      "Every wash uses a hydraulic tip and a four-stage filtration system before the water goes back into the tank for the next clean. That process is specific to bin cleaning — it isn't how our other services handle wastewater.",
    ],
    related: ["pressure-cleaning", "commercial-cleaning"],
    seoTitle: "Bin Cleaning Cairns | Residential & Commercial Bins",
    seoDescription:
      "Residential and commercial bin cleaning in Cairns with recurring and one-off options.",
  },
  {
    slug: "window-cleaning",
    name: "Window Cleaning",
    tone: "glass",
    media: "/media/IMG_3016.jpg",
    cue: "Glass lost its shine?",
    short: "Exterior glass and presentation cleaning.",
    price: "Job price + call-out",
    eyebrow: "WINDOW CLEANING",
    heading: "You notice clean glass when you stop noticing the glass.",
    intro:
      "Tell us the property and what you need cleaned. We'll keep the scope and the price easy to understand.",
    priceModel: "Call-out + job price",
    priceDetail:
      "Priced on window count, access and height. Ground-floor and single-storey work is usually the most straightforward to quote.",
    mediaCaption: "Real Cairns glass, cleaned exterior.",
    seoHeading: "Window cleaning for salt air, dust and wet-season spotting",
    seoParagraphs: [
      "Coastal air, road dust and wet-season rain all leave their mark on glass differently — streaking, spotting or a dull film that regular rain doesn't shift on its own.",
      "We clean the glass you can see from the street and the glass you actually look through — the difference matters more than people expect.",
    ],
    related: ["house-washing", "solar-panel-cleaning"],
    seoTitle: "Window Cleaning Cairns | Residential & Commercial Glass",
    seoDescription: "Window cleaning in Cairns for homes and commercial properties.",
  },
  {
    slug: "solar-panel-cleaning",
    name: "Solar Panels",
    tone: "solar",
    media: "/media/IMG_2912.jpg",
    cue: "Panels looking dusty?",
    short: "Simple per-panel pricing with your suburb added.",
    price: "$14.50 / panel + call-out",
    eyebrow: "SOLAR PANEL CLEANING",
    heading: "Count the panels. We'll do the rest.",
    intro:
      "$14.50 per panel plus the call-out for your suburb. Enter the property location and panel count below to see the job subtotal.",
    priceModel: "$14.50 / panel + call-out",
    priceDetail:
      "Flat rate per panel, no matter the roof. Call-out is based on your suburb — we won't guess a number for an area we haven't loaded yet.",
    mediaCaption: "Real Cairns solar array before cleaning.",
    seoHeading: "Solar panel cleaning and why output actually drops",
    seoParagraphs: [
      "Dust, pollen and the film that builds up in the wet season all cut into how much a panel actually generates — often more than people expect for something that looks only lightly dusty.",
      "Pricing is deliberately simple: a flat rate per panel, plus what it costs us to get to your suburb. No package tiers to decode.",
    ],
    related: ["roof-cleaning", "gutter-cleaning", "window-cleaning"],
    seoTitle: "Solar Panel Cleaning Cairns | $14.50 Per Panel + Call-Out",
    seoDescription:
      "Solar panel cleaning in Cairns from $14.50 per panel plus the local service call-out.",
  },
  {
    slug: "house-washing",
    name: "House Washing",
    tone: "house",
    media: "/media/IMG_3008.jpg",
    cue: "Walls looking tropical?",
    short: "Exterior house washing suited to Cairns conditions.",
    price: "Job price + call-out",
    eyebrow: "HOUSE WASHING",
    heading: "The whole place needs a freshen-up?",
    intro:
      "Start with the suburb and property. We'll work out what surfaces actually need attention and keep the quote clear.",
    priceModel: "Call-out + house job price",
    priceDetail:
      "Priced on wall area, cladding type and how much organic growth has built up. We'll tell you what's realistic before we start.",
    mediaCaption: "Real Cairns exterior wall, tropical buildup visible.",
    seoHeading: "House washing for tropical grime and mould",
    seoParagraphs: [
      "Render, cladding and weatherboard all pick up mould and algae differently in a Cairns wet season — what works on one surface can be too harsh for another.",
      "We match the method to the surface rather than running one setting on every wall.",
    ],
    related: ["window-cleaning", "roof-cleaning", "pressure-cleaning"],
    seoTitle: "House Washing Cairns | Exterior House Cleaning",
    seoDescription: "Exterior house washing in Cairns for tropical grime, mould and buildup.",
  },
  {
    slug: "gutter-cleaning",
    name: "Gutter Cleaning",
    tone: "gutter",
    media: "/media/IMG_2920.jpg",
    cue: "Wet season ready?",
    short: "Gutters, edges and exterior maintenance.",
    price: "Job price + call-out",
    eyebrow: "GUTTER CLEANING",
    heading: "Keep the wet-season water moving.",
    intro:
      "Tell us where the property is. Height, access and gutter size decide the rest of the job.",
    priceModel: "Call-out + job price",
    priceDetail:
      "Priced on roofline length, access and how blocked they are. Single-storey homes are usually the quickest to quote.",
    mediaCaption: "Real Cairns gutter, cleared of leaf litter.",
    seoHeading: "Gutter cleaning before the wet season hits",
    seoParagraphs: [
      "Blocked gutters in a Cairns downpour don't just overflow — they push water somewhere it isn't supposed to go, close to the roofline or the foundations.",
      "Best done before the wet season builds, not after the first big storm finds the blockage for you.",
    ],
    related: ["roof-cleaning", "solar-panel-cleaning", "house-washing"],
    seoTitle: "Gutter Cleaning Cairns | Residential & Commercial",
    seoDescription: "Gutter cleaning in Cairns for homes and commercial properties.",
  },
  {
    slug: "commercial-cleaning",
    name: "Commercial",
    tone: "commercial",
    media: "/media/IMG_2914.jpg",
    cue: "Site needs sorting?",
    short: "Commercial, strata, body corporate and property work.",
    price: "Site-specific",
    eyebrow: "COMMERCIAL & GOVERNMENT",
    heading: "Need the site looked after without chasing the contractor?",
    intro:
      "Tell us the site and what needs cleaning. Straightforward scope, scheduling and site visits for larger work.",
    priceModel: "Site scope or measured price",
    priceDetail:
      "Smaller jobs get the same call-out-plus-job-price model. Larger or recurring sites get a proper scope and, usually, a site visit rather than a number guessed over the phone.",
    mediaCaption: "Real Cairns commercial site, common area cleaned.",
    seoHeading: "Commercial exterior maintenance across Cairns and FNQ",
    seoParagraphs: [
      "Strata, body corporate, hospitality and retail sites all need the exterior looked after around occupancy, not in spite of it — before opening, after hours, or scheduled around guest movement.",
      "The goal is recurring, documented maintenance rather than a one-off clean that starts the clock over again the day the next wet season hits.",
    ],
    related: ["pressure-cleaning", "bin-cleaning", "roof-cleaning"],
    seoTitle: "Commercial Pressure Cleaning Cairns | Strata & Facilities",
    seoDescription:
      "Commercial exterior cleaning in Cairns for strata, facilities, hospitality, car parks and businesses.",
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
