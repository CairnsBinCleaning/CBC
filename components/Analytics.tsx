"use client";

/* Two things live here:
 *
 *  - <AnalyticsListener/>, mounted once in the layout. One delegated click
 *    listener catches every phone tap, email tap and Jobber link on the site,
 *    now and any added later, without touching the components that render
 *    them. Anything else worth counting gets data-track="event_name".
 *
 *  - useLeadEvent(), which fires exactly once when a booking Server Action
 *    comes back successful. Success, not submit — a failed booking is not
 *    a lead and must never be counted as one.
 */

import { useEffect, useRef } from "react";
import { EVENTS, track, trackLead } from "../lib/analytics";

const JOBBER_HOSTS = /(getjobber|clienthub)\./i;

export function AnalyticsListener() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "a[href], button[data-track], [data-track]"
      ) as HTMLElement | null;
      if (!el) return;

      const explicit = el.getAttribute("data-track");
      if (explicit) {
        track(explicit, { label: el.getAttribute("data-track-label") || undefined });
        return;
      }

      const href = el.getAttribute("href") || "";
      if (href.startsWith("tel:")) {
        track(EVENTS.call, { number: href.replace("tel:", ""), where: location.pathname });
      } else if (href.startsWith("mailto:")) {
        track(EVENTS.email, { where: location.pathname });
      } else if (JOBBER_HOSTS.test(href)) {
        track(EVENTS.booking_started, { where: location.pathname });
      }
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // The price list is the closest thing to a warm lead this site produces —
  // worth counting as its own event rather than just a pageview.
  useEffect(() => {
    if (location.pathname.startsWith("/prices")) track(EVENTS.price_list_viewed);
  }, []);

  return null;
}

/** Fire generate_lead once, when a booking actually succeeds. */
export function useLeadEvent(
  result: { ok?: boolean } | null | undefined,
  service: string,
  value?: number
) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current || !result?.ok) return;
    fired.current = true;
    trackLead(service, value);
  }, [result, service, value]);
}
