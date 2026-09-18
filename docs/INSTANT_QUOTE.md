# Instant satellite quote

Customer types their address, taps the corners of their driveway / roof / house
on satellite imagery, and gets a real price on screen. Accepting it creates the
Jobber client and sends Siezar the whole quote.

Live at `/instant-quote`, and mounted on four service pages:
`pressure-cleaning`, `roof-cleaning`, `house-washing`, `commercial-cleaning`.

---

## Files

| File | What it is |
| --- | --- |
| `lib/quote.ts` | All geometry and pricing. **The only file to edit to change a price.** Shared by the map and the server. |
| `components/QuoteMeasure.tsx` | The tool. Client component. |
| `components/QuoteMeasure.module.css` | Scoped styles. Nothing leaks into `globals.css`, nothing in `globals.css` can restyle the map. |
| `lib/jobber/actions.ts` → `bookMeasuredQuote` | Server Action. Recomputes every dollar, then creates the Jobber client. |
| `app/instant-quote/page.tsx` | Standalone page — the URL to point ads and the ute QR code at. |

## Changing the price

Open `lib/quote.ts`, edit `QUOTE_CONFIG`:

```ts
callOutFee: 50,           // charged ONCE per quote, not per area
perM2: 3,                 // build-phase flat rate on every service
minTotal: 50,
wallHeightPerStorey: 2.7, // used for house wash
plans: [ … ]              // recurring discounts — PLACEHOLDERS
```

Nothing else needs touching. The map, the quote card, the Server Action and the
branded quote image all read from here.

`plans` currently carries **placeholder** discounts (10% and 15%). They're
applied to the cleaning, never to the call-out — the call-out is a real cost of
turning up, and discounting it would be pricing sleight-of-hand.

Per-service rates: give each entry in `QUOTE_SERVICES` its own `rate` and read
it in `priceShape` instead of `QUOTE_CONFIG.perM2`. Two-line change.

## How each service is measured

| Service | Mode | Billable area |
| --- | --- | --- |
| Driveway, patio, car park, solar | `area` | the traced polygon |
| Roof wash | `roof` | footprint ÷ cos(pitch) |
| House wash | `walls` | perimeter × 2.7 m × storeys |

A satellite only ever sees a roof's **footprint**. A 22° tile roof has about 8%
more surface than its footprint; a 32° Queenslander about 18%. The pitch
selector adds that back with real geometry (`1/cos θ`), not a fudge factor.

House washing is priced on **wall** area, not floor area — so the customer
traces the building outline and picks the number of storeys.

Window and gutter cleaning deliberately do **not** get this tool. They're priced
per pane and per linear metre; a square-metre tool there would produce a
confident wrong number, which is worse than no number.

## Accuracy

Areas are computed with a local WGS84 projection around each shape's own
centroid (meridional and prime-vertical radii of curvature, then shoelace).
Verified against the `geographiclib` reference implementation on Cairns-latitude
polygons — agreement better than 0.001%.

The common spherical shortcut (what Google's own `computeArea` uses) reads about
**0.5% high** at −17° latitude. On a 2,000 m² car park that's $30 given away on
every quote, which is why it isn't used here.

## Security

The browser sends **raw corner coordinates only** — never a dollar amount.
`bookMeasuredQuote` recomputes every square metre and every dollar server-side
from those coordinates using the same `lib/quote.ts` functions the map uses. A
tampered form cannot book a $2,000 job for $20.

Shapes with fewer than three corners, unknown service ids or non-finite
coordinates are dropped by `priceShape` rather than priced. Shapes are capped at
12 per quote.

**Still to do before heavy traffic:** the Server Action is a public,
unauthenticated write path into the CRM. Add rate limiting (the Upstash Redis
store already wired up for Jobber tokens will do it) and a honeypot field.

## Getting the lead into your inbox

Every accepted quote already:

1. creates a real **Jobber client**, and
2. logs the full quote (shapes, square metres, dollars, resume link) to the
   server log — visible in the Vercel dashboard under the deployment's logs.

For it to land in Gmail, set one environment variable:

```
QUOTE_NOTIFY_WEBHOOK=
```

Point it at a Zapier or Make catch-hook wired to your Gmail (about five minutes
to set up) and the whole quote gets POSTed as JSON the moment it's accepted —
including up to three customer photos and a link that reopens the exact measured
shapes on the map.

No email provider is assumed that isn't actually connected. Left blank, nothing
breaks — you read the bookings in Jobber instead.

## Still open

- **Jobber `requestCreate`** — same gap as every other booking path on this
  site. The Client is created for real; the Request/Job itself waits on
  confirmed field names from the schema-check route. Everything that mutation
  will need is already captured in the logged summary.
- **Rate limiting + honeypot** on `bookMeasuredQuote` (see Security above).
- **Real rates** replacing the $50 / $3 build-phase placeholders.
- **Imagery** is Esri World Imagery via Leaflet — no API key, no billing, no
  quota. Swapping to Google Maps later is a tile-layer change plus a key; the
  geometry, pricing and UI are all independent of it.

## Sharing a quote

The whole quote encodes into the URL hash (`#quote=…`, about 400 characters —
nothing is stored server-side). "Share this quote" produces a link that reopens
the exact shapes, measurements and price for whoever has to approve it. Built
for strata committees and property managers, but it also rescues anyone who
closed the tab.
