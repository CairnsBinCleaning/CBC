"use client";

import Link from "next/link";
import {
  useActionState,
  useMemo,
  useState,
} from "react";

import type {
  PointerEvent,
} from "react";

import {
  getService,
  type Service,
} from "../lib/services";

import { findCallout, SOLAR_RATE } from "../lib/pricing";

import {
  bookBinCleaning,
  type BookBinCleaningResult,
  bookSolarCleaning,
  type BookSolarCleaningResult,
} from "../lib/jobber/actions";

import QuoteMeasure from "./QuoteMeasure";
import ServiceGallery from "./ServiceGallery";
import { useLeadEvent } from "./Analytics";

/* Which service pages get the satellite measure-and-quote tool, and which
   quote service it opens on.
   Only services that are genuinely priced by area are here. Window cleaning
   is priced per pane and gutter cleaning per linear metre — putting a square
   metre tool on those pages would produce a confident wrong number, which is
   worse than no number. */
const MEASURABLE_SERVICES: Record<string, string> = {
  "pressure-cleaning": "driveway",
  "roof-cleaning": "roof",
  "house-washing": "house",
  "commercial-cleaning": "carpark",
};

export default function ServicePageClient({
  service,
}: {
  service: Service;
}) {
  const [audience, setAudience] =
    useState("HOMEOWNER");

  const related = useMemo(
    () =>
      service.related
        .map((slug) => getService(slug))
        .filter(Boolean) as Service[],
    [service]
  );

  return (
    <main
      className={`service-page service-page-${service.slug}`}
    >
      <header className="main-header">
        <Link href="/" className="brand">
          <strong>CAIRNS</strong>
          <span>BIN CLEANING</span>
        </Link>

        <nav>
          <Link href="/">
            SERVICES
          </Link>

          <Link href="/prices">
            PRICES
          </Link>

          <a href="tel:+61434052755">
            0434 052 755
          </a>

          <a
            href={
              service.slug === "bin-cleaning"
                ? "#bin-booking"
                : service.slug === "solar-panel-cleaning"
                  ? "#solar-booking"
                  : MEASURABLE_SERVICES[service.slug]
                    ? "#instant-quote"
                    : "tel:+61434052755"
            }
            className="nav-book-btn"
          >
            {MEASURABLE_SERVICES[service.slug] ? "INSTANT QUOTE" : "BOOK NOW"}
          </a>
        </nav>
      </header>

      <section className="service-hero">
        <div className="service-hero-copy">
          <Link
            href="/"
            className="back-home"
          >
            ← WHAT CAN WE CLEAN?
          </Link>

          <span className="eyebrow">
            {service.eyebrow}
          </span>

          <h1>
            {service.heading}
          </h1>

          <p>
            {service.intro}
          </p>
        </div>

        <div className="service-media">
          <img src={service.media} alt={service.mediaCaption} />
          <span className="service-media-caption">{service.mediaCaption}</span>
        </div>
      </section>

      <ServiceInteraction
        slug={service.slug}
      />

      <section className="who-section">
        <span className="eyebrow">
          NEXT STEP
        </span>

        <h2>
          Who are we
          <br />
          looking after?
        </h2>

        <p>
          You chose the service first.
          Now we make the booking path
          fit the property.
        </p>

        <div className="audience-buttons">
          {[
            "HOMEOWNER",
            "STRATA",
            "BUSINESS",
            "PROPERTY MANAGER",
            "GOVERNMENT",
          ].map((option) => (
            <button
              key={option}
              className={
                audience === option
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setAudience(option)
              }
            >
              {option}
            </button>
          ))}
        </div>

        <div className="audience-result">
          <span>
            SELECTED · {audience}
          </span>

          <strong>
            {audience === "HOMEOWNER" &&
              "Give us the property details and move toward a straightforward estimate or booking."}

            {audience === "STRATA" &&
              "Tell us what you manage. We can build the work into a sensible recurring maintenance schedule."}

            {audience === "BUSINESS" &&
              "Give us the site, service and operating requirements. Larger work can move directly to an inspection."}

            {audience ===
              "PROPERTY MANAGER" &&
              "One property or a portfolio. We want the scope, schedule and communication to be easy to manage."}

            {audience ===
              "GOVERNMENT" &&
              "Move toward capability information, verified documents, scope and procurement contact."}
          </strong>

          <div className="audience-actions">
            <a
              href="tel:+61434052755"
              className="primary-action"
            >
              CALL 0434 052 755
            </a>

            {service.slug === "bin-cleaning" && (
              <a href="#bin-booking" className="secondary-action">
                CONTINUE ONLINE →
              </a>
            )}

            {audience === "STRATA" && (
              <Link href="/strata" className="secondary-action">
                STRATA &amp; BODY CORPORATE →
              </Link>
            )}

            {audience === "GOVERNMENT" && (
              <Link href="/government" className="secondary-action">
                GOVERNMENT &amp; PROCUREMENT →
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="trust-money">
        <div>
          <small>
            TRUST
          </small>

          <strong>
            Real proof belongs
            beside the price.
          </strong>

          <p>
            Google review rating,
            repeat-customer evidence
            and any guarantees will only
            appear here once they are real
            and verified.
          </p>
        </div>

        <div>
          <small>
            TRANSPARENCY
          </small>

          <strong>
            Know what you’re
            paying for.
          </strong>

          <p>
            Measured service,
            clear inclusions,
            access requirements
            and GST treatment before
            work starts.
          </p>
        </div>

        <div>
          <small>
            LONG TERM
          </small>

          <strong>
            We’d rather be
            your next call too.
          </strong>

          <p>
            The goal isn’t one clean.
            It’s becoming the company
            you trust to look after
            the boring stuff.
          </p>
        </div>
      </section>

      <section className="seo-story">
        <span className="eyebrow">
          CAIRNS PROPERTY CARE
        </span>

        <h2>
          {service.seoHeading}
        </h2>

        {service.seoParagraphs.map(
          (paragraph) => (
            <p key={paragraph}>
              {paragraph}
            </p>
          )
        )}
      </section>


      <ServiceGallery service={service} />

      <section className="related-section">
        <span className="eyebrow">
          OFTEN MAKES SENSE TOGETHER
        </span>

        <h2>
          While we’re there…
        </h2>

        <div className="related-grid">
          {related.map((item) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
            >
              <small>
                RELATED SERVICE
              </small>

              <strong>
                {item.name}
              </strong>

              <span>
                EXPLORE →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="service-footer">
        <span>CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/service-areas">Areas</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About</Link>
          <Link href="/prices">Prices</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      <small className="madeBy">Created by Siezar DeWaal</small></footer>
    </main>
  );
}

function ServiceInteraction({
  slug,
}: {
  slug: string;
}) {
  const quoteService = MEASURABLE_SERVICES[slug];

  const signature =
    slug === "bin-cleaning" ? (
      <BinExperience />
    ) : slug === "pressure-cleaning" ? (
      <PressureExperience />
    ) : slug === "solar-panel-cleaning" ? (
      <SolarExperience />
    ) : slug === "commercial-cleaning" ? (
      <CommercialExperience />
    ) : quoteService ? null : (
      <section className="prototype-interaction">
        <span className="eyebrow">
          SIGNATURE INTERACTION
        </span>

        <h2>
          This one still needs
          its own idea.
        </h2>

        <p>
          We won’t reuse another
          service’s gimmick just because
          it already exists.
        </p>
      </section>
    );

  /* The measure-and-quote tool IS the signature interaction for the
     area-priced services — a real price from a real measurement, which is
     the whole "precision, not spectacle" idea made literal. */
  return (
    <>
      {signature}

      {quoteService && (
        <QuoteMeasure
          defaultService={quoteService}
          heading={QUOTE_HEADINGS[slug]?.heading ?? "Measure it yourself. Get the price now."}
          intro={
            QUOTE_HEADINGS[slug]?.intro ??
            "Find your place on the satellite map, tap the corners of what needs cleaning, and the price appears."
          }
        />
      )}
    </>
  );
}

/* Per-service framing for the quote tool. Same instrument, different job —
   a homeowner and a facilities manager are not reading for the same thing. */
const QUOTE_HEADINGS: Record<string, { heading: string; intro: string }> = {
  "pressure-cleaning": {
    heading: "Measure your driveway. Get the price now.",
    intro:
      "Find your place on the satellite map, tap the corners of the concrete, and the price appears. No waiting on a call back, no one in your driveway with a tape measure.",
  },
  "roof-cleaning": {
    heading: "Measure your roof from above.",
    intro:
      "Trace the roof outline on satellite imagery and tell us how steep it is — we add the slope back, because a satellite only ever sees the footprint. Price appears as you draw.",
  },
  "house-washing": {
    heading: "Measure the house. See the wall price.",
    intro:
      "Trace around the building and pick the number of storeys. House washing is priced on wall area, not floor area, so that's exactly what this measures.",
  },
  "commercial-cleaning": {
    heading: "Scope your site before you call us.",
    intro:
      "Trace the car park, loading bays or hardstand on satellite imagery for an indicative figure you can put in front of a budget holder. Larger sites still get a proper site visit — this gets the conversation started with a real number.",
  },
};

/* PRESSURE */

function PressureExperience() {
  const [position, setPosition] =
    useState(30);

  function updatePosition(
    event: PointerEvent<HTMLDivElement>
  ) {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    setPosition(
      Math.max(
        2,
        Math.min(98, x)
      )
    );
  }

  return (
    <section className="prototype-interaction">
      <div className="interaction-heading">
        <span className="eyebrow">
          BEFORE / AFTER
        </span>

        <h2>
          You do one pass.
        </h2>

        <p>
          Drag the surface cleaner.
          We’ll do the actual driveway.
        </p>
      </div>

      <div
        className="pressure-demo"
        onPointerDown={
          updatePosition
        }
        onPointerMove={(event) => {
          if (
            event.buttons === 1
          ) {
            updatePosition(event);
          }
        }}
      >
        <div className="clean-concrete" />

        <div
          className="dirty-concrete"
          style={{
            clipPath: `inset(0 0 0 ${position}%)`,
          }}
        />

        <div
          className="surface-cleaner-tool"
          style={{
            left: `${position}%`,
          }}
        >
          <span>
            ◎
          </span>
        </div>

        <div
          className="clean-line"
          style={{
            left: `${position}%`,
          }}
        />
      </div>

      <p className="interaction-caption">
        Satisfying, isn’t it?
        Even better when you didn’t
        have to do it.
      </p>
    </section>
  );
}

/* BIN */

function BinExperience() {
  const [stage, setStage] =
    useState(0);

  const labels = [
    "OPEN",
    "DIRTY",
    "WASH",
    "FILTER",
    "CLEAN",
  ];

  return (
    <section className="prototype-interaction bin-interaction">
      <div className="interaction-heading">
        <span className="eyebrow">
          CAIRNS BIN CLEANING
        </span>

        <h2>
          This one gets
          special treatment.
        </h2>

        <p>
          Tap the bin to move
          through the real process.
        </p>
      </div>

      <button
        className={`big-bin bin-stage-${stage}`}
        onClick={() =>
          setStage(
            stage === 4
              ? 0
              : stage + 1
          )
        }
      >
        <div className="big-bin-lid" />

        <div className="big-bin-body">
          <div className="big-bin-dirt" />
          <div className="big-bin-foam" />
          <div className="big-bin-shine" />
        </div>

        <div className="big-bin-wheel left" />
        <div className="big-bin-wheel right" />
      </button>

      <div className="bin-stage-label">
        <span>
          STAGE {stage + 1}
        </span>

        <strong>
          {labels[stage]}
        </strong>
      </div>

      {stage === 3 && (
        <div className="filter-system">
          <div>
            <small>
              01
            </small>

            <strong>
              HYDRAULIC TIP
            </strong>
          </div>

          <span>→</span>

          <div>
            <small>
              02
            </small>

            <strong>
              FILTER 1
            </strong>
          </div>

          <span>→</span>

          <div>
            <small>
              03
            </small>

            <strong>
              FILTER 2
            </strong>
          </div>

          <span>→</span>

          <div>
            <small>
              04
            </small>

            <strong>
              FILTER 3
            </strong>
          </div>

          <span>→</span>

          <div>
            <small>
              05
            </small>

            <strong>
              FILTER 4
            </strong>
          </div>

          <span>→</span>

          <div>
            <small>
              06
            </small>

            <strong>
              WATER TANK
            </strong>
          </div>
        </div>
      )}

      <BinBookingForm />
    </section>
  );
}

/* BIN — booking form. Talks to Jobber through a Server Action; nothing
   in this component knows or cares that Jobber exists on the other end. */
function BinBookingForm() {
  const [result, formAction, pending] = useActionState<
    BookBinCleaningResult | null,
    FormData
  >(bookBinCleaning, null);

  useLeadEvent(result, "bin-cleaning");

  return (
    <form
      id="bin-booking"
      action={formAction}
      className="bin-booking"
    >
      <div className="interaction-heading">
        <span className="eyebrow">
          LOCK IN A PLAN
        </span>

        <h2>
          Pick how often.
        </h2>

        <p>
          Nothing added for your suburb.
          Three-service minimum on
          the recurring plans.
        </p>
      </div>

      <div className="bin-plan-options">
        <label className="bin-plan-option">
          <input
            type="radio"
            name="frequency"
            value="fortnightly"
            defaultChecked
          />

          <span>
            <b className="bin-plan-badge">BEST VALUE</b>

            <strong>
              FORTNIGHTLY
            </strong>

            <small>
              $35.95
            </small>
          </span>
        </label>

        <label className="bin-plan-option">
          <input
            type="radio"
            name="frequency"
            value="four-weekly"
          />

          <span>
            <strong>
              EVERY 4 WEEKS
            </strong>

            <small>
              $39.95
            </small>
          </span>
        </label>

        <label className="bin-plan-option">
          <input
            type="radio"
            name="frequency"
            value="casual"
          />

          <span>
            <strong>
              ONE-OFF
            </strong>

            <small>
              $74.95
            </small>
          </span>
        </label>
      </div>

      <label className="bin-upsell">
        <input type="checkbox" name="addOnDriveway" value="yes" />
        <span>
          <strong>While we’re on site — freshen up the driveway too?</strong>
          <small>
            Nothing extra for this visit — we’ll price it and confirm
            when we call to lock in your bin day.
          </small>
        </span>
      </label>

      <div className="bin-booking-fields">
        <input
          name="firstName"
          placeholder="FIRST NAME"
          required
        />

        <input
          name="lastName"
          placeholder="LAST NAME"
        />

        <input
          name="phone"
          type="tel"
          placeholder="PHONE"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="EMAIL (OPTIONAL)"
        />

        <input
          name="street"
          placeholder="STREET ADDRESS"
        />

        <input
          name="suburb"
          placeholder="SUBURB"
          required
        />
      </div>

      <button
        type="submit"
        disabled={pending}
      >
        {pending
          ? "SENDING…"
          : "LOCK IN MY BIN CLEAN →"}
      </button>

      {result && (
        <p
          className={
            result.ok
              ? "bin-booking-status bin-booking-ok"
              : "bin-booking-status bin-booking-error"
          }
        >
          {result.message}
        </p>
      )}
    </form>
  );
}

/* SOLAR */

function SolarExperience() {
  const [suburb, setSuburb] = useState("");
  const [panels, setPanels] = useState(18);

  const match = useMemo(
    () => findCallout(suburb),
    [suburb]
  );

  const subtotal = panels * SOLAR_RATE;
  const total =
    match?.fee != null ? subtotal + match.fee : null;

  const [result, formAction, pending] = useActionState<
    BookSolarCleaningResult | null,
    FormData
  >(bookSolarCleaning, null);

  useLeadEvent(result, "solar-panel-cleaning", total ?? undefined);

  return (
    <section className="prototype-interaction">
      <div className="interaction-heading">
        <span className="eyebrow">
          SOLAR CALCULATOR
        </span>

        <h2>
          Count your panels.
        </h2>

        <p>
          $14.50 a panel, flat rate.
          Add your suburb and we’ll
          work out your visit fee too.
        </p>
      </div>

      <form
        id="solar-booking"
        action={formAction}
        className="solar-calculator"
      >
        <input type="hidden" name="panels" value={panels} />

        <label className="solar-suburb">
          SUBURB
          <input
            name="suburb"
            value={suburb}
            onChange={(event) =>
              setSuburb(event.target.value)
            }
            placeholder="e.g. Trinity Beach"
            required
          />
        </label>

        <div className="panel-count">
          <button
            type="button"
            onClick={() =>
              setPanels(
                Math.max(
                  1,
                  panels - 1
                )
              )
            }
          >
            −
          </button>

          <div>
            <strong>
              {panels}
            </strong>

            <span>
              PANELS
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              setPanels(
                panels + 1
              )
            }
          >
            +
          </button>
        </div>

        <div className="solar-total">
          <small>
            {panels} × ${SOLAR_RATE.toFixed(2)}
          </small>

          <strong>
            ${subtotal.toFixed(2)}
          </strong>

          <small>
            VISIT FEE
          </small>

          <strong>
            {suburb === ""
              ? "Enter a suburb"
              : match
                ? match.fee != null
                  ? `$${match.fee.toFixed(2)} (${match.zone})`
                  : `To be confirmed (${match.zone})`
                : "Outside our loaded list — we’ll check it"}
          </strong>

          {total != null && (
            <>
              <small>
                ESTIMATED TOTAL
              </small>

              <strong className="solar-grand-total">
                ${total.toFixed(2)}
              </strong>
            </>
          )}

          <p>
            Both prices are fixed: $14.50
            a panel and a flat $50 visit
            fee anywhere we service.
          </p>
        </div>

        <div className="bin-booking-fields">
          <input
            name="firstName"
            placeholder="FIRST NAME"
            required
          />

          <input
            name="lastName"
            placeholder="LAST NAME"
          />

          <input
            name="phone"
            type="tel"
            placeholder="PHONE"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="EMAIL (OPTIONAL)"
          />

          <input
            name="street"
            placeholder="STREET ADDRESS"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
        >
          {pending
            ? "SENDING…"
            : "LOCK IN MY SOLAR CLEAN →"}
        </button>

        {result && (
          <p
            className={
              result.ok
                ? "bin-booking-status bin-booking-ok"
                : "bin-booking-status bin-booking-error"
            }
          >
            {result.message}
          </p>
        )}
      </form>
    </section>
  );
}

/* COMMERCIAL */

function CommercialExperience() {
  const [email, setEmail] =
    useState("");

  const mailHref = `mailto:zacsbincleaning@gmail.com?subject=${encodeURIComponent(
    "Commercial capability pack"
  )}&body=${encodeURIComponent(
    `Please send the current capability pack to: ${email || "[your email]"}`
  )}`;

  return (
    <section className="prototype-interaction">
      <div className="interaction-heading">
        <span className="eyebrow">
          COMMERCIAL CAPABILITY
        </span>

        <h2>
          Everything you need.
          Without chasing us.
        </h2>

        <p>
          Only current verified
          documents should ever be
          connected here.
        </p>
      </div>

      <div className="document-grid">
        <article className="abn-card">
          <span>
            LIVE VERIFICATION
          </span>

          <strong>
            ABN 36 318 413 406
          </strong>

          <small>
            Active · GST registered · trading as Cairns Bin Cleaning
            (Siezar Dewaal, sole trader)
          </small>

          <a
            href="https://abr.business.gov.au/ABN/View?id=36318413406"
            target="_blank"
            rel="noopener noreferrer"
            className="abn-verify-link"
          >
            <span className="pulse" />
            CHECK IT YOURSELF ON THE ABR →
          </a>
        </article>

        <article>
          <span>
            DOCUMENT
          </span>

          <strong>
            PUBLIC LIABILITY
          </strong>

          <small>
            Connect verified file
            before launch
          </small>
        </article>

        <article>
          <span>
            DOCUMENT
          </span>

          <strong>
            WORKCOVER
          </strong>

          <small>
            Connect verified file
            before launch
          </small>
        </article>

        <article>
          <span>
            DOCUMENT
          </span>

          <strong>
            SWMS
          </strong>

          <small>
            Current scope-specific
            documents only
          </small>
        </article>

        <article>
          <span>
            DOCUMENT
          </span>

          <strong>
            CAPABILITY
          </strong>

          <small>
            Company capability pack
          </small>
        </article>
      </div>

      <div className="document-email">
        <label>
          SEND THE CURRENT PACK

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            placeholder="work@email.com"
          />
        </label>

        <a href={mailHref} className="document-email-cta">
          EMAIL DOCUMENT PACK →
        </a>

        <p className="document-email-note">
          Opens your email app with the request ready to send.
        </p>
      </div>
    </section>
  );
}
