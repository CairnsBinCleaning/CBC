import type { MetadataRoute } from "next";

/* Web app manifest — this is what lets the site be installed to a phone's
 * home screen as an app, with its own icon and no browser bars.
 *
 * Deliberately NOT an App Store app. Nobody downloads an app to get a
 * driveway quote, so the customer-facing path stays a plain web page. This
 * exists for Siezar: install it once and the quote tool opens full screen
 * from the home screen, so a price can be measured and given while standing
 * in the customer's driveway.
 *
 * start_url points straight at the tool rather than the homepage — opening
 * the app icon should put you one tap from measuring, not on a marketing
 * page you then have to navigate.
 *
 * There is deliberately no service worker. The quote tool needs the network
 * to do its job (satellite tiles, address lookup, sending the booking), so
 * offline caching buys nothing here — and a stale cached page on the path
 * that takes bookings is worse than no offline support at all. Installing
 * does not require one.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/instant-quote",
    name: "Cairns Bin Cleaning — Instant Quote",
    short_name: "CBC Quote",
    description:
      "Measure a driveway, roof, patio or car park on satellite imagery and get a price on the spot.",
    start_url: "/instant-quote",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#06110E",
    theme_color: "#0A4D3A",
    categories: ["business", "productivity", "utilities"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "New quote",
        short_name: "Quote",
        description: "Measure an area and price it",
        url: "/instant-quote",
      },
      {
        name: "Price list",
        short_name: "Prices",
        description: "Every service and price in one list",
        url: "/prices",
      },
    ],
  };
}
