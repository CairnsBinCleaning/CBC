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
          "That didn't go through cleanly on our end — call 0434 052 755 and we'll sort it directly.",
      };
    }

    // The client now exists for real in Jobber. The plan + address below
    // is exactly what the follow-up requestCreate call will need — logged
    // here so nothing is lost while that mutation gets wired up. The
    // driveway add-on isn't a Jobber line item yet either (same reason —
    // no confirmed mutation for it), so it travels the same way: logged
    // now, quoted properly on the follow-up call.
    console.log("New bin cleaning lead — Jobber client created:", {
      clientId: result.clientCreate.client?.id,
      frequency,
      street,
      suburb,
      wantsDrivewayAddOn,
    });

    const label = FREQUENCY_LABEL[frequency] ?? frequency;
    const addOnNote = wantsDrivewayAddOn
      ? " We've also noted you're keen on a driveway freshen-up — we'll quote that when we call."
      : "";

    return {
      ok: true,
      message: `Got it, ${firstName} — we've got your details and the ${label} plan for ${suburb}.${addOnNote} We'll be in touch to lock in the day.`,
    };
  } catch (error) {
    console.error("bookBinCleaning failed:", error);
    return {
      ok: false,
      message: "Something didn't connect on our end — call 0434 052 755 and we'll book you in directly.",
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
          "That didn't go through cleanly on our end — call 0434 052 755 and we'll sort it directly.",
      };
    }

    // Same scope note as bookBinCleaning above: the Client is real in
    // Jobber now. The panel count, rate and total below are exactly what
    // the follow-up requestCreate call will need once that mutation is
    // wired up — logged here so nothing is lost in the meantime.
    console.log("New solar cleaning lead — Jobber client created:", {
      clientId: result.clientCreate.client?.id,
      panels,
      street,
      suburb,
      subtotal,
      calloutFee: callout?.fee ?? null,
      total,
    });

    const priceLine =
      total != null
        ? ` Estimated total: $${total.toFixed(2)} (${panels} panels at $${SOLAR_RATE.toFixed(2)} + ${callout!.zone} call-out).`
        : " We'll confirm your call-out fee and total when we call.";

    return {
      ok: true,
      message: `Got it, ${firstName} — ${panels} panels in ${suburb}.${priceLine} We'll be in touch to lock in the day.`,
    };
  } catch (error) {
    console.error("bookSolarCleaning failed:", error);
    return {
      ok: false,
      message: "Something didn't connect on our end — call 0434 052 755 and we'll book you in directly.",
    };
  }
}
