/* Conversion tracking.
 *
 * Every lead this business gets is a phone call, a booking form, or a quote
 * accepted. Until those fire as events, GA4 shows traffic and nothing else,
 * and no campaign can be judged. This file is the single place those events
 * are named — nothing else in the app should call gtag directly.
 *
 * All of it no-ops safely when NEXT_PUBLIC_GA_ID isn't set, so local dev and
 * preview builds stay silent instead of polluting the property.
 */

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** The event names this site sends. Keep this list short and stable —
 *  every one of these becomes a key event in GA4 and a conversion in
 *  Google Ads, and renaming one breaks the history behind it. */
export const EVENTS = {
  call: "contact_call",
  email: "contact_email",
  booking_started: "booking_started",
  lead: "generate_lead",
  quote_measured: "quote_measured",
  quote_shared: "quote_shared",
  price_list_viewed: "price_list_viewed",
} as const;

export function track(name: string, params: Params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const clean: Params = {};
  for (const [k, v] of Object.entries(params)) if (v !== undefined) clean[k] = v;
  window.gtag("event", name, clean);
}

/* Google Ads "Submit lead form" conversion (primary goal, count one per
   click). The label comes from Google Ads > Goals > Conversions and was
   checked character by character on 19 Sept. The account ID is the same
   NEXT_PUBLIC_ADS_ID that loads the Ads tag in app/layout.tsx. */
const ADS_ID = process.env.NEXT_PUBLIC_ADS_ID;
const ADS_LEAD_LABEL = "Bp7WCKWGhP0cEIepm6c-";

/** A real lead — someone asked us to do work. This is the event that
 *  cost-per-lead is calculated from, so only fire it on genuine success.
 *  It goes to GA4 as generate_lead and to Google Ads as the lead conversion. */
export function trackLead(service: string, value?: number) {
  const rounded = value != null ? Math.round(value * 100) / 100 : undefined;
  track(EVENTS.lead, {
    service,
    value: rounded,
    currency: rounded != null ? "AUD" : undefined,
  });
  if (ADS_ID) {
    track("conversion", {
      send_to: `${ADS_ID}/${ADS_LEAD_LABEL}`,
      value: rounded ?? 1.0,
      currency: "AUD",
    });
  }
}
