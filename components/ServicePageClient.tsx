"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useActionState,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getService,
  type Service,
} from "../lib/services";

import { findCallout, solarQuote, SOLAR_RATE } from "../lib/pricing";

import {
  bookBinCleaning,
  type BookBinCleaningResult,
  bookSolarCleaning,
  type BookSolarCleaningResult,
  requestServiceQuote,
  type RequestServiceQuoteResult,
} from "../lib/jobber/actions";

import { windowQuote, WINDOW_RATES, type WindowType } from "../lib/quote";
import LazyQuote from "./LazyQuote";
import ServiceGallery from "./ServiceGallery";
import SiteHeader from "./SiteHeader";
import TrustBar from "./TrustBar";
import FormPromise from "./FormPromise";
import ComplianceDocs from "./ComplianceDocs";
import ReviewQuotes from "./ReviewQuotes";
import { useLeadEvent } from "./Analytics";
import { serviceFaq } from "../lib/serviceFaq";

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
  "gutter-cleaning": "gutter",
};

export default function ServicePageClient({
  service,
  footer,
}: {
  service: Service;
  /* Rendered on the server (app/[slug]/page.tsx) so the footer's link
     lists don't ship in this page's JavaScript. */
  footer?: ReactNode;
}) {
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
      <SiteHeader
        commercial={service.slug === "commercial-cleaning"}
        cta={{
          href:
            service.slug === "bin-cleaning"
              ? "#bin-booking"
              : service.slug === "solar-panel-cleaning"
                ? "#solar-booking"
                : MEASURABLE_SERVICES[service.slug]
                  ? "#instant-quote"
                  : "#quote-request",
          label: MEASURABLE_SERVICES[service.slug]
            ? "Instant quote"
            : service.slug === "bin-cleaning" || service.slug === "solar-panel-cleaning"
              ? "Book now"
              : "Get a price",
        }}
      />

      <section className="service-hero">
        <div className="service-hero-copy">
          <Link
            href="/"
            className="back-home"
          >
            ← WHAT CAN WE CLEAN?
          </Link>

          <h1>
            {/* The search phrase leads the H1 so Google and the ads both read
                "[service] Cairns" as the page's subject. Styled as the eyebrow. */}
            <span className="eyebrow h1-kicker">
              {service.keyword}
            </span>{" "}
            {service.heading}
          </h1>

          <p>
            {service.intro}
          </p>

          <TrustBar />
        </div>

        <div className="service-media">
          {(() => {
            /* Hero photo: the first thing on the page, so it loads first.
               Dimensions come from its gallery entry. */
            const hero = service.gallery.find((p) => p.src === service.media);
            return hero ? (
              <Image
                src={service.media}
                alt={hero.alt}
                width={hero.width}
                height={hero.height}
                sizes="(max-width: 850px) 100vw, 50vw"
                loading="eager"
                fetchPriority="high"
                quality={60}
              />
            ) : (
              /* Not in the gallery (window page's IMG_2935 was a 440 KB raw
                 JPEG on phones). fill = sized by .service-media, still
                 resized and converted to AVIF/WebP by next/image. */
              <Image
                src={service.media}
                alt={service.mediaCaption}
                fill
                sizes="(max-width: 850px) 100vw, 50vw"
                loading="eager"
                fetchPriority="high"
                quality={60}
              />
            );
          })()}
          <span className="service-media-caption">{service.mediaCaption}</span>
        </div>
      </section>

      <ServiceInteraction
        slug={service.slug}
      />

      {/* 20 Sept: one of each. Real photos first, then reviews once, then the
          questions. The longer search copy sits in a closed panel under the FAQ
          so Google still reads it without it filling the phone screen. */}
      <ServiceGallery service={service} />

      <ReviewQuotes slug={service.slug} />

      <section className="service-faq" aria-labelledby="service-faq-title">
        <span className="eyebrow">COMMON QUESTIONS</span>
        <h2 id="service-faq-title">{service.name} in Cairns, answered.</h2>
        <dl>
          {serviceFaq(service).map(({ q, a }) => (
            <div key={q}>
              <dt>{q}</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="seo-story">
        <details>
          <summary>More about {service.name.toLowerCase()} in Cairns</summary>
          <h2>{service.seoHeading}</h2>
          {service.seoParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </details>
      </section>

      <nav className="related-links" aria-label="Related services">
        <span>While we&rsquo;re there:</span>
        {related.map((item) => (
          <Link key={item.slug} href={`/${item.slug}`}>
            {item.name}
          </Link>
        ))}
        {service.slug === "commercial-cleaning" && (
          <>
            <Link href="/strata">Strata</Link>
            <Link href="/government">Government</Link>
            <Link href="/commercial">All commercial &amp; industrial services</Link>
          </>
        )}
      </nav>

      {footer}
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
    ) : slug === "solar-panel-cleaning" ? (
      <SolarExperience />
    ) : slug === "commercial-cleaning" ? (
      <CommercialExperience />
    ) : quoteService ? null : (
      <QuoteRequestForm slug={slug} />
    );

  /* The measure-and-quote tool IS the signature interaction for the
     area-priced services — a real price from a real measurement, which is
     the whole "precision, not spectacle" idea made literal. */
  return (
    <>
      {signature}

      {quoteService && (
        <LazyQuote
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
  "gutter-cleaning": {
    heading: "Trace the roof edge. See the gutter price.",
    intro:
      "Find your place on the satellite map, tap the corners of the roof, and pick single or double storey. $199 single, $299 double covers the first 45 m of gutter, downpipes flushed. Longer runs add $4 a metre.",
  },
  "commercial-cleaning": {
    heading: "Scope your site before you call us.",
    intro:
      "Trace the car park, loading bays or hardstand on satellite imagery for an indicative figure you can put in front of a budget holder. Larger sites still get a proper site visit — this gets the conversation started with a real number.",
  },
};

function BinExperience() {
  /* The tap-to-clean bin animation was removed 19 Sept at Siezar's call.
     The booking form is the whole point of this section. */
  return (
    <section className="prototype-interaction bin-interaction">
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
      {/* Honeypot: hidden from people, filled by bots. See lib/guard.ts. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />

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
      <FormPromise />

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
  const [onBinDay, setOnBinDay] = useState(false);

  /* Same solarQuote() the booking action uses (lib/pricing.ts). */
  const { subtotal, total } = useMemo(
    () => solarQuote(panels, suburb, onBinDay),
    [panels, suburb, onBinDay]
  );

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
          $14.50 a panel, flat rate,
          the same in every suburb.
          No call-out fee.
        </p>
      </div>

      <form
        id="solar-booking"
        action={formAction}
        className="solar-calculator"
      >
        {/* Honeypot: hidden from people, filled by bots. See lib/guard.ts. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />

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
            {panels} PANELS × ${SOLAR_RATE.toFixed(2)}
            {subtotal > panels * SOLAR_RATE ? " · JOBS FROM $179" : ""}
          </small>

          <label className="bin-day-toggle">
            <input
              type="checkbox"
              name="binDay"
              checked={onBinDay}
              onChange={(event) => setOnBinDay(event.target.checked)}
            />
            Do it on my bin-clean day. We&rsquo;re already in your
            street.
          </label>

          {/* The suburb adjustment is folded into the price, never shown as
              its own line (lib/pricing.ts). No suburb, no final price. */}
          <small>YOUR PRICE</small>
          <strong className={total != null ? "solar-grand-total" : undefined}>
            {suburb.trim() === ""
              ? "Enter your suburb"
              : total != null
                ? `$${total.toFixed(2)}`
                : "We’ll check your suburb"}
          </strong>

          <p>
            ${SOLAR_RATE.toFixed(2)} a panel, GST included. The price
            above is for your suburb, with no call-out fee.
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
        <FormPromise />

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
          Insurance, WorkCover and our
          SWMS, ready to download now.
          No waiting on a reply to get
          the paperwork.
        </p>
      </div>

      <div className="document-grid">
        <ComplianceDocs />
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

/* QUOTE REQUEST — window and gutter cleaning.
   Priced per pane and per metre of roofline, so there's no honest instant
   number to show. This takes the job description, shows the one real
   published figure (the suburb loading) and creates the Jobber client and
   request, same as every other booking path. */

const QUOTE_REQUEST_COPY: Record<string, { heading: string; intro: string; placeholder: string; name: string }> = {
  "window-cleaning": {
    name: "Window Cleaning",
    heading: "Tell us about the windows.",
    intro: "$9.95 a pane outside only, $14.95 inside and out. Count the panes for your price now, then send it and we lock in a day.",
    placeholder: "e.g. single-storey house, about 14 windows, outside only, plus the sliding doors",
  },
  "gutter-cleaning": {
    name: "Gutter Cleaning",
    heading: "Tell us about the gutters.",
    intro: "Single or double storey, and whether they’re overflowing yet. We’ll come back with one price for the job.",
    placeholder: "e.g. lowset house, gutters overflowing at the back corner, big mango tree over the roof",
  },
};

function QuoteRequestForm({ slug }: { slug: string }) {
  const copy = QUOTE_REQUEST_COPY[slug] ?? {
    name: getService(slug)?.name ?? "Service",
    heading: "Tell us about the job.",
    intro: "A couple of lines is plenty. We’ll come back with one price for the job.",
    placeholder: "What needs cleaning, and roughly how big is it?",
  };
  const [suburb, setSuburb] = useState("");
  const match = useMemo(() => findCallout(suburb), [suburb]);
  /* Windows are priced per pane (lib/quote.ts), so they get a real number. */
  const isWindows = slug === "window-cleaning";
  const [panes, setPanes] = useState("");
  const [windowType, setWindowType] = useState<WindowType>("outside");
  const win = windowQuote(Number(panes), windowType);
  const winLoading = match && win.price ? Math.round(win.price * match.loading * 100) / 100 : null;
  const [result, formAction, pending] = useActionState<RequestServiceQuoteResult | null, FormData>(
    requestServiceQuote,
    null
  );

  useLeadEvent(result, slug);

  return (
    <section className="prototype-interaction" id="quote-request">
      <form action={formAction} className="bin-booking">
        {/* Honeypot: hidden from people, filled by bots. See lib/guard.ts. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />
        <input type="hidden" name="serviceName" value={copy.name} />

        <div className="interaction-heading">
          <span className="eyebrow">GET A PRICE</span>
          <h2>{copy.heading}</h2>
          <p>{copy.intro}</p>
        </div>

        <label className="solar-suburb">
          SUBURB
          <input
            name="suburb"
            value={suburb}
            onChange={(event) => setSuburb(event.target.value)}
            placeholder="e.g. Trinity Beach"
            required
          />
        </label>

        {suburb.trim() !== "" && (
          <p className={`quote-request-fee${match ? " is-ok" : ""}`}>
            {match
              ? `We cover ${match.suburb}.${isWindows ? "" : " The job is priced when we reply."}`
              : "Not on our loaded list yet. Send it anyway and we’ll check."}
          </p>
        )}

        {isWindows && (
          <div className="pane-calc">
            <label>
              PANES
              <input
                name="panes"
                type="number"
                inputMode="numeric"
                min={1}
                max={500}
                value={panes}
                onChange={(event) => setPanes(event.target.value)}
                placeholder="e.g. 20"
              />
            </label>
            <div className="pane-type" role="group" aria-label="Which sides">
              {(["outside", "both"] as WindowType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={windowType === t}
                  onClick={() => setWindowType(t)}
                >
                  {t === "outside" ? "Outside only" : "Inside & out"}
                  <small>${WINDOW_RATES[t].toFixed(2)} a pane</small>
                </button>
              ))}
            </div>
            <input type="hidden" name="windowType" value={windowType} />
            {win.price > 0 && (
              <p className="pane-total">
                <span>
                  {win.panes} panes × ${win.rate.toFixed(2)}
                  {win.panes * win.rate < 179 ? " · jobs start from $179" : ""}
                </span>
                {/* Price includes the suburb adjustment; none shown until
                    the suburb is known. */}
                <strong>
                  {winLoading != null
                    ? `$${(win.price + winLoading).toFixed(2)}`
                    : suburb.trim()
                      ? "We’ll check your suburb"
                      : "Enter your suburb above"}
                </strong>
              </p>
            )}
          </div>
        )}

        <textarea name="scope" rows={3} placeholder={copy.placeholder} className="quote-request-scope" />

        <div className="bin-booking-fields">
          <input name="firstName" placeholder="FIRST NAME" autoComplete="given-name" required />
          <input name="lastName" placeholder="LAST NAME" autoComplete="family-name" />
          <input name="phone" type="tel" placeholder="PHONE" autoComplete="tel" required />
          <input name="email" type="email" placeholder="EMAIL (OPTIONAL)" autoComplete="email" />
          <input name="street" placeholder="STREET ADDRESS" autoComplete="street-address" />
        </div>

        <button type="submit" disabled={pending}>
          {pending ? "SENDING…" : "SEND MY QUOTE REQUEST →"}
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
