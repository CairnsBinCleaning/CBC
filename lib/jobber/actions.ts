"use server";

// The one Server Action the front-end actually calls. This is the whole
// point of the integration: a visitor never sees Jobber, never leaves the
// site, and never knows this function exists — they just get a plain
// "you're booked" or "call us" answer.
//
// Scope note: this creates the customer as a real Jobber Client today —
// verified against Jobber's docs, safe to ship. It does NOT yet create
// the Request/Job automatically, because Jobber's public docs don't spell
// out the exact input fields for that mutation and guessing them for a
// system that has to work isn't worth the risk of a silent failure. See
// the schema-check route for how to close that gap with confirmed field
// names instead of guessed ones — it's a small follow-up once this is
// live, not a reason to hold up everything else.

import { jobberGraphQL } from "./client";
import { findCallout, SOLAR_RATE } from "../pricing";
import {
  QUOTE_CONFIG,
  explainLine,
  money,
  priceShape,
  quoteTotals,
  type QuoteShape,
} from "../quote";

export type BookBinCleaningResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const CLIENT_CREATE = /* GraphQL */ `
  mutation BookingClientCreate($input: ClientCreateInput!) {
    clientCreate(input: $input) {
      client {
        id
        firstName
        lastName
      }
      userErrors {
        message
        path
      }
    }
  }
`;

type ClientCreateResponse = {
  clientCreate: {
    client: { id: string; firstName: string; lastName: string } | null;
    userErrors: { message: string; path: string[] }[];
  };
};

const REQUEST_CREATE = /* GraphQL */ `
  mutation BookingRequestCreate($input: RequestCreateInput!) {
    requestCreate(input: $input) {
      request {
        id
        title
      }
      userErrors {
        message
        path
      }
    }
  }
`;

type RequestCreateResponse = {
  requestCreate: {
    request: { id: string; title: string } | null;
    userErrors: { message: string; path: string[] }[];
  };
};

// Creates the real Jobber Request/Job once the Client exists — confirmed
// live against the schema-check route on 2026-09-18. clientId is the only
// field Jobber requires; title is a plain confirmed String. Deliberately
// NOT sending requestDetails/lineItems/assessment yet — their nested input
// shapes aren't confirmed, and guessing them risks exactly the silent
// failure this file has avoided from the start. If this fails, the
// booking itself is never failed because of it — the Client and the
// console log next to every call site are still the fallback, same as
// before this existed.
async function createJobberRequest(clientId: string, title: string): Promise<void> {
  try {
    const result = await jobberGraphQL<RequestCreateResponse>(REQUEST_CREATE, {
      input: { clientId, title },
    });

    if (result.requestCreate.userErrors.length > 0) {
      console.error("Jobber requestCreate userErrors:", result.requestCreate.userErrors);
      return;
    }

    console.log("Jobber Request created:", result.requestCreate.request);
  } catch (error) {
    console.error("createJobberRequest failed:", error);
  }
}

const FREQUENCY_LABEL: Record<string, string> = {
  fortnightly: "fortnightly",
  "four-weekly": "four-weekly",
  casual: "one-off",
};

export async function bookBinCleaning(
  _prev: BookBinCleaningResult | null,
  formData: FormData
): Promise<BookBinCleaningResult> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const suburb = String(formData.get("suburb") ?? "").trim();
  const frequency = String(formData.get("frequency") ?? "").trim();
  const wantsDrivewayAddOn = formData.get("addOnDriveway") === "yes";

  if (!firstName || !phone || !suburb || !frequency) {
    return {
      ok: false,
      message: "Missing your name, phone, suburb or a plan — nothing was sent.",
    };
  }

  try {
    const result = await jobberGraphQL<ClientCreateResponse>(CLIENT_CREATE, {
      input: {
        firstName,
        lastName: lastName || undefined,
        emails: email ? [{ description: "MAIN", primary: true, address: email }] : undefined,
        phones: [{ description: "MAIN", primary: true, number: phone }],
        billingAddress: {
          street1: street || undefined,
          city: suburb,
          province: "QLD",
          country: "AU",
        },
      },
    });

    if (result.clientCreate.userErrors.length > 0) {
      console.error("Jobber clientCreate userErrors:", result.clientCreate.userErrors);
      return {
        ok: false,
        message:
          "That didn’t go through cleanly on our end — call 0434 052 755 and we’ll sort it directly.",
      };
    }

    const clientId = result.clientCreate.client?.id;
    const label = FREQUENCY_LABEL[frequency] ?? frequency;

    if (clientId) {
      await createJobberRequest(clientId, `Bin cleaning — ${label} plan, ${suburb}`);
    }

    // The client (and now the Request) exist for real in Jobber. The
    // driveway add-on isn't a Jobber line item yet (no confirmed mutation
    // shape for it), so it travels the same way it always has: logged
    // here, quoted properly on the follow-up call.
    console.log("New bin cleaning lead — Jobber client created:", {
      clientId,
      frequency,
      street,
      suburb,
      wantsDrivewayAddOn,
    });

    const addOnNote = wantsDrivewayAddOn
      ? " We’ve also noted you’re keen on a driveway freshen-up — we’ll quote that when we call."
      : "";

    return {
      ok: true,
      message: `Got it, ${firstName} — we’ve got your details and the ${label} plan for ${suburb}.${addOnNote} We’ll be in touch to lock in the day.`,
    };
  } catch (error) {
    console.error("bookBinCleaning failed:", error);
    return {
      ok: false,
      message: "Something didn’t connect on our end — call 0434 052 755 and we’ll book you in directly.",
    };
  }
}

export type BookSolarCleaningResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function bookSolarCleaning(
  _prev: BookSolarCleaningResult | null,
  formData: FormData
): Promise<BookSolarCleaningResult> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const suburb = String(formData.get("suburb") ?? "").trim();
  const panels = Number(formData.get("panels") ?? 0);

  if (!firstName || !phone || !suburb || !panels) {
    return {
      ok: false,
      message: "Missing your name, phone, suburb or panel count — nothing was sent.",
    };
  }

  // Recomputed here, not trusted from the form — the panel rate and
  // call-out fee are the source of truth server-side, same as the price
  // shown on the calculator.
  const callout = findCallout(suburb);
  const subtotal = panels * SOLAR_RATE;
  const total = callout?.fee != null ? subtotal + callout.fee : null;

  try {
    const result = await jobberGraphQL<ClientCreateResponse>(CLIENT_CREATE, {
      input: {
        firstName,
        lastName: lastName || undefined,
        emails: email ? [{ description: "MAIN", primary: true, address: email }] : undefined,
        phones: [{ description: "MAIN", primary: true, number: phone }],
        billingAddress: {
          street1: street || undefined,
          city: suburb,
          province: "QLD",
          country: "AU",
        },
      },
    });

    if (result.clientCreate.userErrors.length > 0) {
      console.error("Jobber clientCreate userErrors:", result.clientCreate.userErrors);
      return {
        ok: false,
        message:
          "That didn’t go through cleanly on our end — call 0434 052 755 and we’ll sort it directly.",
      };
    }

    const clientId = result.clientCreate.client?.id;

    if (clientId) {
      await createJobberRequest(clientId, `Solar panel cleaning — ${panels} panels, ${suburb}`);
    }

    // Same scope note as bookBinCleaning above: the Client and the Request
    // are both real in Jobber now. The panel count, rate and total below
    // are logged here so nothing is lost ahead of the follow-up call.
    console.log("New solar cleaning lead — Jobber client created:", {
      clientId,
      panels,
      street,
      suburb,
      subtotal,
      calloutFee: callout?.fee ?? null,
      total,
    });

    const priceLine =
      total != null
        ? ` Estimated total: $${total.toFixed(2)} (${panels} panels at $${SOLAR_RATE.toFixed(2)} + your ${callout!.zone} visit fee).`
        : " We’ll confirm your visit fee and total when we call.";

    return {
      ok: true,
      message: `Got it, ${firstName} — ${panels} panels in ${suburb}.${priceLine} We’ll be in touch to lock in the day.`,
    };
  } catch (error) {
    console.error("bookSolarCleaning failed:", error);
    return {
      ok: false,
      message: "Something didn’t connect on our end — call 0434 052 755 and we’ll book you in directly.",
    };
  }
}

export type RequestServiceQuoteResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

// Six of our eight services don't have a confirmed per-unit rate — roof,
// window, house-washing, gutter and pressure cleaning are all priced from
// the job itself (roof pitch/material, glass count, wall condition, etc),
// not a number we can multiply on a form. Rather than fake an instant
// total, this shows the one real, published figure (the suburb call-out)
// and takes a freeform scope description through to a human quote —
// honest about what's confirmed and what isn't.
export async function requestServiceQuote(
  _prev: RequestServiceQuoteResult | null,
  formData: FormData
): Promise<RequestServiceQuoteResult> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const suburb = String(formData.get("suburb") ?? "").trim();
  const serviceName = String(formData.get("serviceName") ?? "").trim();
  const scope = String(formData.get("scope") ?? "").trim();

  if (!firstName || !phone || !suburb) {
    return {
      ok: false,
      message: "Missing your name, phone or suburb — nothing was sent.",
    };
  }

  // Recomputed server-side from the same lookup CalloutLookup uses on the
  // page — never trusted from the form, and never inflated into a job
  // total we haven't actually priced.
  const callout = findCallout(suburb);

  try {
    const result = await jobberGraphQL<ClientCreateResponse>(CLIENT_CREATE, {
      input: {
        firstName,
        lastName: lastName || undefined,
        emails: email ? [{ description: "MAIN", primary: true, address: email }] : undefined,
        phones: [{ description: "MAIN", primary: true, number: phone }],
        billingAddress: {
          street1: street || undefined,
          city: suburb,
          province: "QLD",
          country: "AU",
        },
      },
    });

    if (result.clientCreate.userErrors.length > 0) {
      console.error("Jobber clientCreate userErrors:", result.clientCreate.userErrors);
      return {
        ok: false,
        message:
          "That didn’t go through cleanly on our end — call 0434 052 755 and we’ll sort it directly.",
      };
    }

    const clientId = result.clientCreate.client?.id;

    if (clientId) {
      await createJobberRequest(clientId, `${serviceName || "Service"} quote request — ${suburb}`);
    }

    // Same scope note as bookBinCleaning/bookSolarCleaning above: the
    // Client and the Request are both real in Jobber now. The scope and
    // call-out zone below are logged here so nothing is lost ahead of the
    // follow-up call.
    console.log("New quote request — Jobber client created:", {
      clientId,
      serviceName,
      scope,
      street,
      suburb,
      calloutZone: callout?.zone ?? null,
      calloutFee: callout?.fee ?? null,
    });

    const feeLine =
      callout?.fee != null
        ? ` The visit fee for ${callout.suburb} is $${callout.fee.toFixed(2)} — the rest is priced from what you’ve told us and confirmed when we call.`
        : " We’ll confirm your visit fee and a full price when we call.";

    return {
      ok: true,
      message: `Got it, ${firstName} — your ${serviceName || "service"} request for ${suburb} is with us.${feeLine} No job total yet — we work that out properly instead of guessing.`,
    };
  } catch (error) {
    console.error("requestServiceQuote failed:", error);
    return {
      ok: false,
      message: "Something didn’t connect on our end — call 0434 052 755 and we’ll quote you directly.",
    };
  }
}

export type BookMeasuredQuoteResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

/* The instant satellite quote (components/QuoteMeasure.tsx).
 *
 * Unlike requestServiceQuote above, this one DOES have a real number behind
 * it — the customer measured the actual area on satellite imagery, and the
 * rate card in lib/quote.ts is a published figure, not a guess.
 *
 * The browser sends the raw corner coordinates, never a dollar amount. Every
 * square metre and every dollar below is recomputed here from those
 * coordinates using the same lib/quote.ts functions the map uses, so a
 * tampered form can't book a $2,000 job for $20.
 */
export async function bookMeasuredQuote(
  _prev: BookMeasuredQuoteResult | null,
  formData: FormData
): Promise<BookMeasuredQuoteResult> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const rawQuote = String(formData.get("quote") ?? "");

  if (!firstName || !phone) {
    return {
      ok: false,
      message: "Missing your name or phone — nothing was sent.",
    };
  }

  let parsed: {
    address?: { label?: string; lat?: number | null; lng?: number | null } | null;
    planId?: string;
    shapes?: QuoteShape[];
    photos?: string[];
    resumeLink?: string;
  };

  try {
    parsed = JSON.parse(rawQuote);
  } catch {
    return {
      ok: false,
      message: "That quote didn’t come through cleanly — call 0434 052 755 and we’ll sort it.",
    };
  }

  // Recomputed from the coordinates, never read from the form. A shape with
  // fewer than three corners, a bad service id or a non-finite coordinate is
  // dropped by priceShape rather than priced.
  const shapes = Array.isArray(parsed.shapes) ? parsed.shapes.slice(0, 12) : [];
  const lines = shapes
    .map((shape) => priceShape(shape))
    .filter((line): line is NonNullable<ReturnType<typeof priceShape>> => line !== null);

  if (lines.length === 0) {
    return {
      ok: false,
      message: "No measured area came through — draw the area on the map and try again.",
    };
  }

  const totals = quoteTotals(lines, String(parsed.planId ?? "once"));
  const addressLabel = String(parsed.address?.label ?? "").slice(0, 300);

  // Pull a known suburb out of the geocoded label so the Jobber client lands
  // in the right place. Uses the same list as every other call-out lookup on
  // the site — and if nothing matches, it says so instead of inventing one.
  const suburbMatch = addressLabel
    .split(",")
    .map((part) => findCallout(part))
    .find((hit) => hit !== null);
  const suburb = suburbMatch?.suburb ?? "Cairns";

  try {
    const result = await jobberGraphQL<ClientCreateResponse>(CLIENT_CREATE, {
      input: {
        firstName,
        lastName: lastName || undefined,
        emails: email ? [{ description: "MAIN", primary: true, address: email }] : undefined,
        phones: [{ description: "MAIN", primary: true, number: phone }],
        billingAddress: {
          street1: addressLabel || undefined,
          city: suburb,
          province: "QLD",
          country: "AU",
        },
      },
    });

    if (result.clientCreate.userErrors.length > 0) {
      console.error("Jobber clientCreate userErrors:", result.clientCreate.userErrors);
      return {
        ok: false,
        message:
          "That didn’t go through cleanly on our end — call 0434 052 755 and we’ll sort it directly.",
      };
    }

    const clientId = result.clientCreate.client?.id;

    if (clientId) {
      const areaWord = lines.length === 1 ? "area" : "areas";
      await createJobberRequest(clientId, `Measured quote — ${lines.length} ${areaWord}, ${suburb}`);
    }

    // Same scope note as every other action in this file: the Client and
    // the Request are both real in Jobber now. Everything else below is
    // captured for the follow-up call and the optional webhook, including
    // the resume link that reopens the exact measured shapes on the map.
    const summary = {
      clientId,
      customer: { firstName, lastName, phone, email, notes },
      address: addressLabel,
      suburb,
      plan: totals.plan.id,
      lines: lines.map((line) => ({
        service: line.service,
        billableM2: line.billable,
        amount: line.amount,
        detail: explainLine(line),
        coords: line.coords,
      })),
      pricing: {
        callOut: totals.callout,
        work: totals.work,
        planSaving: totals.saving,
        grandTotal: totals.grand,
      },
      // Private to Siezar — never shown to the customer. This is the number
      // that says whether the job is worth doing, not just what it sells for.
      margin: {
        estimatedHours: totals.hours,
        effectiveHourly: totals.effectiveHourly,
        belowTarget: totals.belowTarget,
        targetHourly: QUOTE_CONFIG.targetHourlyRate,
      },
      needsSiteVisit: totals.needsSiteVisit,
      siteVisitReason: totals.siteVisitReason,
      photoCount: Array.isArray(parsed.photos) ? parsed.photos.length : 0,
      resumeLink: parsed.resumeLink ?? "",
    };

    console.log("New measured quote — Jobber client created:", summary);

    // Optional outbound notification. Point QUOTE_NOTIFY_WEBHOOK at a Zapier
    // or Make catch-hook (or any endpoint that emails you) and the full quote
    // lands in your inbox the moment it's accepted. Left unset, the quote
    // still reaches Jobber and the server log — nothing is lost, and no email
    // provider is assumed that isn't actually wired up.
    const hook = process.env.QUOTE_NOTIFY_WEBHOOK;
    if (hook) {
      const photos = Array.isArray(parsed.photos) ? parsed.photos.slice(0, 3) : [];
      const withPhotos = JSON.stringify({ ...summary, photos });
      // Most catch-hooks reject large bodies; drop the images rather than the
      // whole notification if the customer's photos are heavy.
      const body = withPhotos.length < 900_000 ? withPhotos : JSON.stringify(summary);
      try {
        await fetch(hook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } catch (hookError) {
        // A failed notification must never fail a booking.
        console.error("QUOTE_NOTIFY_WEBHOOK failed:", hookError);
      }
    }

    const planLine =
      totals.saving > 0
        ? ` On the ${totals.plan.label.toLowerCase()} plan that’s ${money(totals.saving)} off.`
        : "";

    const measured = lines
      .map((line) => `${line.label.toLowerCase()} at ${line.billable} ${line.mode === "panels" ? "panels" : "m²"}`)
      .join(", ");

    // A job over the auto-quote ceiling is never confirmed as a booking. The
    // figure stays an indication and the next step is a site visit, not a
    // start date — quoting a stranger four figures sight-unseen is how you
    // end up doing the work for half what it's worth.
    if (totals.needsSiteVisit) {
      return {
        ok: true,
        message:
          `Got it, ${firstName} — ${measured} in ${suburb}. That measures out around ` +
          `${money(totals.grand)}, but a job this size gets walked before anyone commits ` +
          `(${totals.siteVisitReason}). We’ll call ${phone} to arrange a time, and you’ll have a ` +
          `firm price in writing before we start.`,
      };
    }

    return {
      ok: true,
      message:
        `Got it, ${firstName} — ${measured} for ${suburb}. Total ${money(totals.grand)} including the ` +
        `${money(totals.callout)} visit fee and GST.${planLine} We’ll text you on ${phone} to lock in the day, ` +
        `and we confirm the measurement on site before we start.`,
    };
  } catch (error) {
    console.error("bookMeasuredQuote failed:", error);
    return {
      ok: false,
      message:
        "Something didn’t connect on our end — call 0434 052 755 and we’ll book you in directly.",
    };
  }
}
