/* Commercial niche pages (/commercial/[slug]).

   One page per kind of commercial job, so a facilities manager, strata
   manager, café owner or council officer who searches for the exact job
   ("car park cleaning Cairns", "bin room cleaning", "graffiti removal")
   lands on a page about exactly that.

   Every service listed here is one Siezar confirmed he does (20 Sept 2026):
   car parks and driveways, bin rooms, refuse chutes and commercial bins,
   shopfronts and footpaths, building and roof washes, windows inside and
   out, commercial kitchens (deep cleans, canopies, exhaust fans; grease traps via a
   licensed contractor, confirmed 20 Sept), timber
   revitalising and graffiti removal. Photos are real jobs only; pages with
   no real photo simply show none. No prices beyond the site-wide $179
   minimum: commercial work is walked and quoted in writing. */

export type CommercialPhoto = { src: string; alt: string; suburb: string; width: number; height: number };

export type CommercialPage = {
  slug: string;
  name: string; // short name for links
  keyword: string; // leads the H1, what buyers type into Google
  heading: string;
  intro: string;
  who: string; // who this page is for
  covers: string[]; // what we clean
  searches: string; // other ways people search for it (visible copy)
  photos: CommercialPhoto[];
  faq: { q: string; a: string }[];
  needs: string[]; // walkthrough form tick-boxes
  seoTitle: string;
  seoDescription: string;
};

const HOW_PRICED =
  "Every commercial site is walked first. We look at the area, access and how often it needs doing, then send one written price. Every job starts from $179, GST included.";

const INSURED =
  "Yes. $20 million public liability, WorkCover Queensland and a written safe work method statement (SWMS). You can download the certificates on this page.";

const HOURS =
  "Yes. We schedule around your trading hours, residents and deliveries, including early starts before you open.";

export const commercialPages: CommercialPage[] = [
  {
    slug: "car-park-cleaning",
    name: "Car parks & driveways",
    keyword: "Car Park Cleaning Cairns",
    heading: "Car parks, ramps and loading docks, cleaned properly.",
    intro:
      "Oil drips, tyre marks, mould on the ramps and grime around the bays. We pressure clean car parks, driveways and loading docks for shops, offices, strata complexes and warehouses across Cairns.",
    who: "Shopping strips, office buildings, strata complexes, warehouses and industrial yards.",
    covers: [
      "Undercover and open car parks",
      "Ramps, entries and exits",
      "Loading docks and service areas",
      "Oil and tyre-mark stains on concrete",
      "Driveways and access roads",
      "Line-marked bays and pedestrian walkways",
    ],
    searches:
      "Also searched as car park pressure cleaning, parking lot cleaning, carpark washing, loading dock cleaning, oil stain removal from concrete and commercial driveway cleaning in Cairns.",
    photos: [
      {
        src: "/media/commercial-carpark-rotary-cairns-city.jpg",
        alt: "Operator running a rotary surface cleaner across a commercial carpark ramp in Cairns City",
        suburb: "Cairns City",
        width: 1200,
        height: 1600,
      },
    ],
    faq: [
      { q: "How is car park cleaning priced?", a: HOW_PRICED },
      { q: "Can you clean before we open?", a: HOURS },
      { q: "Are you insured for commercial sites?", a: INSURED },
    ],
    needs: ["Car park", "Ramps / entries", "Loading dock", "Oil stains", "Driveways"],
    seoTitle: "Car Park Cleaning Cairns | Loading Docks & Ramps",
    seoDescription:
      "Car park, ramp, loading dock and driveway pressure cleaning in Cairns for shops, offices, strata and warehouses. Insured, scheduled around trading hours.",
  },
  {
    slug: "bin-room-cleaning",
    name: "Bin rooms, refuse chutes & commercial bins",
    keyword: "Bin Room & Refuse Chute Cleaning Cairns",
    heading: "The room nobody wants to go into. We do.",
    intro:
      "Bin rooms, bin bays and refuse chutes are where the smell, the flies and the complaints start. We clean the whole refuse area: the chute, the room, the floor and the bins themselves, from wheelie bins to bulk bins.",
    who: "Strata and apartment complexes, cafés and restaurants, shopping centres, offices and industrial sites.",
    covers: [
      "Refuse chutes, top to bottom",
      "Bin rooms and bin bays: walls, floors and drains",
      "Commercial wheelie bins",
      "Bulk and skip-style bins",
      "Bin wash areas behind cafés and restaurants",
      "Recurring schedules so it never gets bad again",
    ],
    searches:
      "Also searched as garbage chute cleaning, rubbish chute cleaning, bin room cleaning, bin bay cleaning, commercial bin cleaning, restaurant bin cleaning and skip bin cleaning in Cairns.",
    photos: [
      {
        src: "/media/strata-refuse-room-cairns-city.jpg",
        alt: "Wheelie bins lined up in a strata refuse room in Cairns City ready for cleaning",
        suburb: "Cairns City",
        width: 1296,
        height: 972,
      },
      {
        src: "/media/commercial-bulk-bins-portsmith.jpg",
        alt: "Large green bulk bins cleaned and lined up at a Portsmith commercial site",
        suburb: "Portsmith",
        width: 1200,
        height: 1600,
      },
      {
        src: "/media/commercial-bin-fleet-rows-earlville.jpg",
        alt: "Rows of cleaned red-lid and green wheelie bins lined up at an Earlville commercial site",
        suburb: "Earlville",
        width: 1600,
        height: 1200,
      },
    ],
    faq: [
      { q: "Do you clean the refuse chute itself?", a: "Yes. We clean the whole refuse system: the chute, the bin room and the bins." },
      { q: "How is it priced?", a: HOW_PRICED },
      { q: "Are you insured for strata and commercial sites?", a: INSURED },
    ],
    needs: ["Refuse chute", "Bin room / bin bay", "Commercial wheelie bins", "Bulk bins", "Recurring schedule"],
    seoTitle: "Bin Room & Refuse Chute Cleaning Cairns",
    seoDescription:
      "Refuse chute, bin room, bin bay and bulk bin cleaning in Cairns for strata, restaurants, shopping centres and offices. Insured, recurring schedules available.",
  },
  {
    slug: "shopfront-footpath-cleaning",
    name: "Shopfronts & footpaths",
    keyword: "Shopfront & Footpath Cleaning Cairns",
    heading: "First impressions start at the footpath.",
    intro:
      "Customers judge a shop before they walk in. We clean shopfronts, entries, awnings and the footpath out front, remove chewing gum and grime, and clean the windows inside and out.",
    who: "Retail shops, cafés, restaurants, medical and professional offices, and shopping strips.",
    covers: [
      "Footpaths and entries",
      "Chewing gum removal",
      "Shopfronts and awnings",
      "Windows, inside and out",
      "Outdoor dining areas",
      "Signage and frontage walls",
    ],
    searches:
      "Also searched as shopfront cleaning, footpath pressure cleaning, gum removal, awning cleaning, commercial window cleaning and café outdoor area cleaning in Cairns.",
    photos: [
      {
        src: "/media/commercial-frontage-collins-ave-cairns-city.jpg",
        alt: "Cleaned footpath and frontage at a Collins Avenue commercial property in Edge Hill, Cairns",
        suburb: "Edge Hill",
        width: 1600,
        height: 1200,
      },
    ],
    faq: [
      { q: "Can you clean before we open?", a: HOURS },
      { q: "Do you do windows as well?", a: "Yes, inside and out, on the same visit." },
      { q: "How is it priced?", a: HOW_PRICED },
    ],
    needs: ["Footpath / entry", "Gum removal", "Shopfront / awning", "Windows inside & out", "Outdoor dining area"],
    seoTitle: "Shopfront & Footpath Cleaning Cairns | Gum Removal",
    seoDescription:
      "Shopfront, footpath, awning and entry cleaning in Cairns, with chewing gum removal and windows inside and out. Scheduled before you open.",
  },
  {
    slug: "building-washing",
    name: "Building, roof & timber washes",
    keyword: "Commercial Building Washing Cairns",
    heading: "Walls, roofs and timber that look looked after.",
    intro:
      "Mould, dirt and wet-season staining make a good building look neglected. We soft wash building exteriors, warehouse walls and roofs and signage, and revitalise weathered timber.",
    who: "Offices, warehouses, industrial buildings, strata complexes, schools and council buildings.",
    covers: [
      "Building exteriors and cladding",
      "Warehouse and shed walls",
      "Metal and tile roofs (no asbestos or fibro)",
      "Signage",
      "Timber revitalising: decks, boardwalks, screens and facades",
      "Gutters",
    ],
    searches:
      "Also searched as building wash, commercial soft washing, exterior building cleaning, warehouse roof cleaning, cladding cleaning, timber deck restoration and sign cleaning in Cairns.",
    photos: [
      {
        src: "/media/clad-wall-after-soft-wash-gordonvale.jpg",
        alt: "Long cleaned clad wall of a Gordonvale building after soft washing",
        suburb: "Gordonvale",
        width: 1600,
        height: 1200,
      },
      {
        src: "/media/roof-cleaned-shed-profile-edge-hill.jpg",
        alt: "Cleaned white metal roof on an Edge Hill building",
        suburb: "Edge Hill",
        width: 1600,
        height: 1200,
      },
    ],
    faq: [
      { q: "Do you clean asbestos or fibro roofs?", a: "No. We clean metal and tile roofs only." },
      { q: "How is it priced?", a: HOW_PRICED },
      { q: "Are you insured?", a: INSURED },
    ],
    needs: ["Building exterior", "Roof", "Signage", "Timber revitalising", "Gutters"],
    seoTitle: "Commercial Building Washing Cairns | Soft Wash",
    seoDescription:
      "Commercial building soft washing in Cairns: exteriors, cladding, warehouse roofs, signage and timber revitalising. Insured, SWMS on file.",
  },
  {
    slug: "graffiti-removal",
    name: "Graffiti removal",
    keyword: "Graffiti Removal Cairns",
    heading: "Tagged overnight. Gone before it spreads.",
    intro:
      "Graffiti left up invites more. We remove graffiti from walls, fences, shutters and signage on commercial and council sites around Cairns.",
    who: "Shops, warehouses, strata complexes, schools and council assets.",
    covers: [
      "Brick, block and rendered walls",
      "Fences",
      "Roller doors and shutters",
      "Signage",
      "Footpaths and paving",
    ],
    searches:
      "Also searched as graffiti cleaning, tag removal, graffiti removal from brick and commercial graffiti removal in Cairns.",
    photos: [],
    faq: [
      { q: "How is graffiti removal priced?", a: "It depends on the surface and how big the area is. Send a photo or book a walkthrough and we'll give you a written price. Every job starts from $179, GST included." },
      { q: "Are you insured?", a: INSURED },
    ],
    needs: ["Walls", "Fences", "Roller doors / shutters", "Signage", "Footpaths"],
    seoTitle: "Graffiti Removal Cairns | Commercial Graffiti Cleaning",
    seoDescription:
      "Graffiti removal in Cairns from walls, fences, shutters, signage and paving for shops, warehouses, strata and council sites. Insured.",
  },
  {
    slug: "commercial-kitchen-cleaning",
    name: "Commercial kitchens & exhaust canopies",
    keyword: "Commercial Kitchen Cleaning Cairns",
    heading: "Kitchen deep cleans, done by an ex-chef.",
    intro:
      "Siezar spent 13 years as a chef before he started cleaning, so he knows where the grease hides and what an inspector looks at. We deep clean the whole kitchen: canopies and filters, exhaust fans, fryers, grills, ovens, cool rooms, walls, floors and drains, plus the bin area out the back. Done after close or before you open.",
    who: "Restaurants, cafés, takeaways, clubs, pubs, hotels, school and aged care kitchens, and food production sites.",
    covers: [
      "Exhaust canopies, hoods and filters",
      "Exhaust fans and ductwork",
      "Fryers, grills, salamanders, ovens and combi ovens",
      "Stainless steel benches and splashbacks, revitalised",
      "Cool rooms, freezers and door seals",
      "Walls, ceilings, floors and floor drains, degreased",
      "Pre-inspection deep cleans before a food licence inspection",
      "Bin areas, loading docks and grease-stained concrete out the back",
      "Grease trap pump-outs, arranged through a licensed waste contractor",
    ],
    searches:
      "Also searched as restaurant kitchen cleaning, kitchen deep clean, exhaust canopy cleaning, rangehood cleaning, kitchen exhaust cleaning, stainless steel cleaning, cool room cleaning, grease trap cleaning and café kitchen cleaning in Cairns.",
    photos: [],
    faq: [
      { q: "Can you clean after close?", a: HOURS },
      {
        q: "Do you know how a commercial kitchen works?",
        a: "Yes. Siezar was a chef for 13 years, so the equipment gets cleaned the way a kitchen needs it: food-safe chemicals, everything back where your team expects it, and ready for service.",
      },
      {
        q: "Do you do grease traps?",
        a: "Yes, we arrange grease trap pump-outs through a licensed liquid waste contractor, so you have one person to call for the whole kitchen.",
      },
      { q: "How is it priced?", a: HOW_PRICED },
      { q: "Are you insured?", a: INSURED },
    ],
    needs: ["Full kitchen deep clean", "Canopies / filters", "Exhaust fans / ducts", "Fryers / ovens / grills", "Cool rooms", "Floors / walls / drains", "Grease trap", "Bin area out back"],
    seoTitle: "Commercial Kitchen Cleaning Cairns | Canopies & Exhaust",
    seoDescription:
      "Commercial kitchen deep cleaning in Cairns by an ex-chef: exhaust canopies, filters, fans, fryers, ovens, cool rooms, floors and drains. After close. Insured.",
  },
  {
    slug: "commercial-equipment-cleaning",
    name: "Kitchen equipment deep cleans & descaling",
    keyword: "Commercial Oven & Dishwasher Cleaning Cairns",
    heading: "Ovens, dishwashers and stainless, back to working order.",
    intro:
      "Baked-on grease cuts oven efficiency and scale chokes dishwashers. We deep clean commercial ovens and cooking equipment, descale dishwashers and glasswashers, and bring tired stainless steel back up. Siezar was a chef for 13 years, so it all goes back ready for service.",
    who: "Restaurants, cafés, pubs, clubs, hotels, bakeries, school and aged care kitchens, and food production sites.",
    covers: [
      "Commercial ovens, combi ovens and grills degreased",
      "Fryers, ranges and cooktops",
      "Commercial dishwashers and glasswashers descaled",
      "Stainless steel benches, splashbacks and doors revitalised",
      "Equipment pulled out, cleaned behind and put back",
    ],
    searches:
      "Also searched as commercial oven cleaning, combi oven cleaning, dishwasher descaling, glasswasher descaling, stainless steel restoration, kitchen equipment cleaning and restaurant equipment deep clean in Cairns.",
    photos: [],
    faq: [
      { q: "Can you do it after we close?", a: "Yes. We work after close or before you open, so the kitchen is ready for the next service." },
      { q: "How is it priced?", a: HOW_PRICED },
      { q: "Are you insured?", a: INSURED },
    ],
    needs: ["Ovens / combi ovens", "Fryers / grills", "Dishwasher descale", "Glasswasher descale", "Stainless steel", "Full kitchen deep clean"],
    seoTitle: "Commercial Oven & Dishwasher Cleaning Cairns | Descaling",
    seoDescription:
      "Commercial oven, fryer and grill deep cleaning, dishwasher and glasswasher descaling, and stainless steel revitalising in Cairns. After close. Insured.",
  },
  {
    slug: "commercial-deep-cleaning",
    name: "Commercial space deep cleans",
    keyword: "Commercial Deep Cleaning Cairns",
    heading: "One deep clean that resets the whole site.",
    intro:
      "Before an inspection, after a fit-out, at the end of a lease or just because it has got away from you. We deep clean commercial spaces top to bottom, inside and out, and leave it ready to trade.",
    who: "Shops, offices, warehouses, food businesses, clubs, schools and property managers handing over a site.",
    covers: [
      "Hard floors scrubbed, degreased and rinsed",
      "Walls, doors and high-touch areas",
      "Kitchens and staff rooms",
      "Windows inside and out",
      "Bin areas, loading docks and back-of-house",
      "Outside: entries, footpaths, car parks and building exterior",
    ],
    searches:
      "Also searched as commercial deep clean, end of lease commercial cleaning, pre-inspection clean, post fit-out cleaning, warehouse deep clean, shop deep clean and industrial deep cleaning in Cairns.",
    photos: [],
    faq: [
      { q: "Can you work around our trading hours?", a: HOURS },
      { q: "How is it priced?", a: HOW_PRICED },
      { q: "Are you insured?", a: INSURED },
    ],
    needs: ["Floors", "Walls / doors", "Kitchen / staff room", "Windows", "Bin area / back-of-house", "Outside areas"],
    seoTitle: "Commercial Deep Cleaning Cairns | End of Lease & Fit-Out",
    seoDescription:
      "Commercial deep cleaning in Cairns: floors, walls, kitchens, windows and bin areas. End of lease, pre-inspection and post fit-out. Insured, quoted in writing.",
  },
  {
    slug: "industrial-cleaning",
    name: "Industrial cleaning",
    keyword: "Industrial Cleaning Cairns",
    heading: "Industrial sites, cleaned by one contractor.",
    intro:
      "Warehouses, workshops, yards and depots collect oil, grime, mould and rubbish in places nobody wants to deal with. We pressure clean and deep clean industrial sites across Cairns, from the hardstand to the roof.",
    who: "Warehouses, workshops, depots, industrial estates, transport yards and food production sites, including Portsmith, Bungalow and the southside.",
    covers: [
      "Hardstands, yards and loading docks",
      "Warehouse and workshop floors",
      "Oil and grease stains on concrete",
      "Bulk bins, bin bays and refuse areas",
      "Building exteriors, walls and roofs (no asbestos or fibro)",
      "Gutters, signage and windows",
    ],
    searches:
      "Also searched as industrial pressure cleaning, warehouse cleaning, workshop floor cleaning, hardstand cleaning, factory cleaning, degreasing concrete and industrial cleaners in Cairns.",
    photos: [
      {
        src: "/media/commercial-bulk-bins-portsmith.jpg",
        alt: "Bulk commercial bins cleaned at an industrial site in Portsmith",
        suburb: "Portsmith",
        width: 1200,
        height: 1600,
      },
    ],
    faq: [
      { q: "How is industrial cleaning priced?", a: HOW_PRICED },
      { q: "Can you work around shifts and deliveries?", a: HOURS },
      { q: "Are you insured for industrial sites?", a: INSURED },
    ],
    needs: ["Hardstand / yard", "Warehouse floor", "Oil stains", "Bulk bins / bin bay", "Building / roof", "Gutters / windows"],
    seoTitle: "Industrial Cleaning Cairns | Warehouses, Workshops, Yards",
    seoDescription:
      "Industrial cleaning in Cairns: warehouses, workshops, hardstands, loading docks, bulk bins and building exteriors. Insured, SWMS on file, worked around shifts.",
  },
  {
    slug: "commercial-roof-cleaning",
    name: "Commercial & school roof cleaning",
    keyword: "Commercial Roof Cleaning Cairns",
    heading: "Big roofs, soft washed without damage.",
    intro:
      "Mould and lichen on a large roof hold water, stain and look neglected from the street. We soft wash metal and tile roofs on schools, warehouses, offices and strata buildings, with a crew, harnesses and a safe work method statement on file.",
    who: "Schools, warehouses, offices, churches, clubs and strata complexes.",
    covers: [
      "Metal (Colorbond) roofs",
      "Tile roofs",
      "Curved and multi-level roofs",
      "Roofs with solar panels",
      "Gutters cleared on the same visit",
      "No asbestos or fibro roofs",
    ],
    searches:
      "Also searched as commercial roof soft washing, school roof cleaning, warehouse roof cleaning, roof mould removal, Colorbond roof cleaning and roof lichen removal in Cairns.",
    photos: [
      {
        src: "/media/IMG_3156.jpg",
        alt: "School roof in Brinsmead after a roof soft wash, ranges behind",
        suburb: "Brinsmead",
        width: 2400,
        height: 1800,
      },
    ],
    faq: [
      { q: "Do you clean asbestos or fibro roofs?", a: "No. We clean metal and tile roofs only." },
      { q: "Can you work around school hours?", a: "Yes. We plan the work around the school, sign in on your contractor system, and keep our insurance and WorkCover on file with you." },
      { q: "How is it priced?", a: HOW_PRICED },
    ],
    needs: ["Metal roof", "Tile roof", "Roof with solar", "Gutters", "Walls / exterior"],
    seoTitle: "Commercial & School Roof Cleaning Cairns | Soft Wash",
    seoDescription:
      "School, warehouse and strata roof soft washing in Cairns: metal and tile roofs, gutters on the same visit, no asbestos. Insured, SWMS, worked around your hours.",
  },
  {
    slug: "commercial-window-cleaning",
    name: "Commercial windows, inside & out",
    keyword: "Commercial Window Cleaning Cairns",
    heading: "Clear glass, inside and out.",
    intro:
      "Salt, dust and wet-season spotting build up fast on Cairns glass. We clean shopfront and office windows inside and out, with frames, tracks and sills done on the same visit.",
    who: "Shops, offices, cafés, clubs, strata foyers and showrooms.",
    covers: [
      "Shopfront glass inside and out",
      "Office and foyer windows",
      "Frames, tracks and sills",
      "Glass doors and balustrades",
      "Regular schedules or one-off cleans",
    ],
    searches:
      "Also searched as shopfront window cleaning, office window cleaning, commercial glass cleaning and window cleaners for businesses in Cairns.",
    photos: [],
    faq: [
      { q: "Can you do them before we open?", a: HOURS },
      { q: "How is it priced?", a: HOW_PRICED },
      { q: "Are you insured?", a: INSURED },
    ],
    needs: ["Shopfront glass", "Office windows", "Glass doors / balustrades", "Frames / tracks", "Regular schedule"],
    seoTitle: "Commercial Window Cleaning Cairns | Inside and Out",
    seoDescription:
      "Commercial window cleaning in Cairns: shopfront and office glass inside and out, frames, tracks, doors and balustrades. Scheduled around trading hours.",
  },
  {
    slug: "timber-restoration",
    name: "Timber revitalising",
    keyword: "Timber Deck Restoration Cairns",
    heading: "Grey, mouldy timber brought back.",
    intro:
      "Cairns sun and humidity turn timber grey, green and slippery. We clean and revitalise decks, boardwalks, screens, pergolas and timber facades on commercial sites and homes.",
    who: "Cafés and restaurants with timber decks, resorts, clubs, strata complexes and homeowners.",
    covers: [
      "Decks and boardwalks",
      "Timber screens and battens",
      "Pergolas and outdoor furniture areas",
      "Timber facades and cladding",
      "Mould and slippery surfaces made safe",
    ],
    searches:
      "Also searched as deck cleaning, deck restoration, timber cleaning, boardwalk cleaning, deck revitalising and timber mould removal in Cairns.",
    photos: [],
    faq: [
      { q: "How is it priced?", a: HOW_PRICED },
      { q: "Can you work around our trading hours?", a: HOURS },
      { q: "Are you insured?", a: INSURED },
    ],
    needs: ["Deck / boardwalk", "Screens / battens", "Pergola", "Timber facade"],
    seoTitle: "Timber Deck Restoration Cairns | Decks & Boardwalks",
    seoDescription:
      "Timber deck, boardwalk, screen and pergola cleaning and revitalising in Cairns for businesses and homes. Mould and slippery timber made safe. Insured.",
  },
];

export const getCommercialPage = (slug: string) => commercialPages.find((p) => p.slug === slug);
