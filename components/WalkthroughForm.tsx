"use client";

/* Strata / commercial site walkthrough request. A property manager picks a
   preferred day and time, ticks what the site needs, and it lands in Jobber
   as a Request through the same requestServiceQuote action (and spam guard)
   every other quote form uses. */

import { useActionState, useMemo, useState } from "react";
import FormPromise from "./FormPromise";
import { requestServiceQuote, type RequestServiceQuoteResult } from "../lib/jobber/actions";
import { findCallout } from "../lib/pricing";
import { useLeadEvent } from "./Analytics";

const NEEDS = [
  "Common property pressure cleaning",
  "Car park / driveways",
  "Refuse room + bins",
  "Windows",
  "Gutters",
  "Building wash",
];

function isoDay(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default function WalkthroughForm({
  audience = "Strata",
  options = NEEDS,
}: {
  audience?: string;
  /* Tick-boxes for what the site needs; each commercial page passes its own. */
  options?: string[];
}) {
  const [suburb, setSuburb] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("Morning");
  const [needs, setNeeds] = useState<string[]>([]);
  const [site, setSite] = useState("");
  const [units, setUnits] = useState("");
  const match = useMemo(() => findCallout(suburb), [suburb]);
  /* Strata and government keep units/lots; commercial sites are sized by area. */
  const isStrata = audience !== "Commercial";
  const [result, formAction, pending] = useActionState<RequestServiceQuoteResult | null, FormData>(
    requestServiceQuote,
    null
  );
  useLeadEvent(result, `${audience.toLowerCase()}-walkthrough`);

  const when = day
    ? new Date(day + "T00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })
    : "";
  const serviceName = `${audience} site walkthrough${when ? ` (prefers ${when}, ${time.toLowerCase()})` : ""}`;
  const scope = [
    site && `Site: ${site}`,
    units && `${isStrata ? "Units/lots" : "Size"}: ${units}`,
    needs.length ? `Needs: ${needs.join(", ")}` : "",
    when && `Preferred: ${when}, ${time}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="prototype-interaction walkthrough" id="walkthrough">
      <form action={formAction} className="bin-booking">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />
        <input type="hidden" name="serviceName" value={serviceName} />
        <input type="hidden" name="scope" value={scope} />

        <div className="interaction-heading">
          <span className="eyebrow">BOOK A SITE WALKTHROUGH</span>
          <h2>Walk the site with us. Get a proper scope.</h2>
          <p>Pick a day that suits. We confirm the time by text, walk the property with you, then send one written price.</p>
        </div>

        <div className="walk-grid">
          <label>
            {isStrata ? "SITE OR COMPLEX NAME" : "BUSINESS OR SITE NAME"}
            <input value={site} onChange={(e) => setSite(e.target.value)} placeholder={isStrata ? "e.g. Palm Court Apartments" : "e.g. Smithfield shopping centre"} />
          </label>
          <label>
            SUBURB
            <input name="suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="e.g. Edge Hill" required />
          </label>
          <label>
            {isStrata ? "UNITS / LOTS (ROUGHLY)" : "HOW BIG (ROUGHLY)"}
            <input inputMode={isStrata ? "numeric" : "text"} value={units} onChange={(e) => setUnits(e.target.value)} placeholder={isStrata ? "e.g. 24" : "e.g. 40 car parks, 3 bin rooms"} />
          </label>
          <label>
            PREFERRED DAY
            <input type="date" value={day} min={isoDay(1)} max={isoDay(60)} onChange={(e) => setDay(e.target.value)} />
          </label>
        </div>

        {suburb.trim() !== "" && (
          <p className={`quote-request-fee${match ? " is-ok" : ""}`}>
            {match ? `We cover ${match.suburb}.` : "Not on our list yet. Send it anyway and we’ll check."}
          </p>
        )}

        <div className="pane-type walk-times" role="group" aria-label="Preferred time">
          {["Morning", "Midday", "Afternoon"].map((t) => (
            <button key={t} type="button" aria-pressed={time === t} onClick={() => setTime(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="walk-needs" role="group" aria-label="What the site needs">
          {options.map((n) => (
            <label key={n} className={needs.includes(n) ? "on" : ""}>
              <input
                type="checkbox"
                checked={needs.includes(n)}
                onChange={(e) => setNeeds((p) => (e.target.checked ? [...p, n] : p.filter((x) => x !== n)))}
              />
              {n}
            </label>
          ))}
        </div>

        <div className="bin-booking-fields">
          <input name="firstName" placeholder="FIRST NAME" autoComplete="given-name" required />
          <input name="lastName" placeholder="LAST NAME" autoComplete="family-name" />
          <input name="phone" type="tel" placeholder="PHONE" autoComplete="tel" required />
          <input name="email" type="email" placeholder="EMAIL" autoComplete="email" />
          <input name="street" placeholder="SITE STREET ADDRESS" autoComplete="street-address" />
        </div>

        <button type="submit" disabled={pending}>
          {pending ? "SENDING…" : "REQUEST THE WALKTHROUGH →"}
        </button>
        <FormPromise />

        {result && (
          <p className={result.ok ? "bin-booking-status bin-booking-ok" : "bin-booking-status bin-booking-error"}>
            {result.message}
          </p>
        )}
      </form>
    </section>
  );
}
