/* /llms.txt: a plain-text summary of the business for AI assistants and
   search tools (the llmstxt.org convention). Built from the same files the
   site uses (services, prices, zones, FAQs), so it can't drift out of date.
   Facts only: no instructions to AI systems, no claims the site doesn't make. */

import { calloutZones, SUBURB_NOTE } from "../../lib/pricing";
import { QUOTE_CONFIG } from "../../lib/quote";
import { serviceFaq } from "../../lib/serviceFaq";
import { services } from "../../lib/services";
import { GOOGLE_REVIEWS } from "../../lib/stats";

export const dynamic = "force-static";

const SITE = "https://www.cairnsbincleaning.com.au";

export function GET() {
  const svc = services
    .map((s) => {
      /* Price, area and insurance answers are already stated once above. */
      const faq = serviceFaq(s)
        .filter((f) => !/^(How much|Which areas|Are you insured)/.test(f.q))
        .map((f) => `  - ${f.q} ${f.a}`)
        .join("\n");
      return `### [${s.name}](${SITE}/${s.slug})\n${s.short}\n- Price: ${s.price}. ${s.priceDetail}\n${faq}`;
    })
    .join("\n\n");

  const zones = calloutZones.map((z) => `- ${z.name}: ${z.suburbs.join(", ")}`).join("\n");

  const body = `# Cairns Bin Cleaning

> Owner-operated exterior cleaning business in Cairns, Queensland, Australia. Wheelie bin cleaning, pressure cleaning (driveways, patios, concrete), roof soft washing, house washing, gutter cleaning, window cleaning, solar panel cleaning, and commercial, strata and government work (trading for commercial work as CBC Exterior & Property Maintenance).

## Key facts
- Phone: 0434 052 755 (+61 434 052 755)
- Email: zacsbincleaning@gmail.com
- Hours: 7:30am to 5:30pm, every day
- ABN: 36 318 413 406
- Fully insured ($20 million public liability), WorkCover Queensland, SWMS on file
- Google rating: ${GOOGLE_REVIEWS.rating.toFixed(1)} stars from ${GOOGLE_REVIEWS.count} reviews (${GOOGLE_REVIEWS.url})
- All prices include GST. Every job starts from $${QUOTE_CONFIG.minTotal} (bin cleaning has its own prices).
- ${SUBURB_NOTE}
- Instant online quote: measure the area on an aerial map of your address and get the price straight away, then book: ${SITE}/instant-quote
- Owner: Siezar DeWaal (${SITE}/faq#siezar-dewaal)

## Services
${svc}

## Service area
Cairns and surrounds, Gordonvale to Palm Cove (postcodes 4865, 4868, 4869, 4870, 4878, 4879).
${zones}

## Pages
- [All prices](${SITE}/prices)
- [Instant quote](${SITE}/instant-quote)
- [Service areas](${SITE}/service-areas)
- [FAQ](${SITE}/faq)
- [About](${SITE}/about)
- [Strata and body corporate](${SITE}/strata)
- [Government and council](${SITE}/government)
- [Booking terms](${SITE}/terms)
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
