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
} from "../lib/jobber/actions";

type Point = {
  x: number;
  y: number;
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

          <div className="price-preview">
            <small>
              HOW PRICING WORKS
            </small>

            <strong>
              {service.priceModel}
            </strong>

            <p>
              {service.priceDetail}
            </p>

            {service.slug !== "bin-cleaning" && <CalloutLookup />}

            <Link
              href="/prices"
              className="mini-link"
            >
              FULL PRICE LIST →
            </Link>
          </div>
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
          WHO ARE WE
          <br />
          LOOKING AFTER?
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
            Know what you're
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
            We'd rather be
            your next call too.
          </strong>

          <p>
            The goal isn't one clean.
            It's becoming the company
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

      <section className="related-section">
        <span className="eyebrow">
          OFTEN MAKES SENSE TOGETHER
        </span>

        <h2>
          WHILE WE'RE THERE...
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
          <Link href="/prices">Prices</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>
    </main>
  );
}

/* Small suburb → call-out zone lookup, reused across every service page
   except bin cleaning (which has no call-out). Never invents a dollar
   figure — if a zone's fee isn't loaded yet, it says so plainly. */
function CalloutLookup() {
  const [suburb, setSuburb] = useState("");
  const match = useMemo(() => findCallout(suburb), [suburb]);

  return (
    <div className="callout-lookup">
      <label>
        YOUR SUBURB
        <input
          value={suburb}
          onChange={(event) => setSuburb(event.target.value)}
          placeholder="e.g. Edge Hill"
        />
      </label>

      {suburb && (
        <p className={match ? "callout-found" : "callout-unknown"}>
          {match
            ? match.fee != null
              ? `Call-out for ${match.suburb}: $${match.fee.toFixed(2)}`
              : `${match.suburb} is in our ${match.zone} zone — call-out fee still being confirmed.`
            : "Not in our loaded suburb list yet — we'll confirm it when you call."}
        </p>
      )}
    </div>
  );
}

function ServiceInteraction({
  slug,
}: {
  slug: string;
}) {
  if (slug === "window-cleaning") {
    return <WindowExperience />;
  }

  if (slug === "bin-cleaning") {
    return <BinExperience />;
  }

  if (slug === "pressure-cleaning") {
    return <PressureExperience />;
  }

  if (
    slug ===
    "solar-panel-cleaning"
  ) {
    return <SolarExperience />;
  }

  if (
    slug ===
    "commercial-cleaning"
  ) {
    return <CommercialExperience />;
  }

  return (
    <section className="prototype-interaction">
      <span className="eyebrow">
        SIGNATURE INTERACTION
      </span>

      <h2>
        THIS ONE STILL NEEDS
        ITS OWN IDEA.
      </h2>

      <p>
        We won't reuse another
        service's gimmick just because
        it already exists.
      </p>
    </section>
  );
}

/* WINDOWS */

function WindowExperience() {
  const [points, setPoints] =
    useState<Point[]>([]);

  const [dragging, setDragging] =
    useState(false);

  function addPoint(
    event: PointerEvent<HTMLDivElement>
  ) {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    const y =
      ((event.clientY - rect.top) /
        rect.height) *
      100;

    setPoints((current) => [
      ...current.slice(-150),
      { x, y },
    ]);
  }

  const progress = Math.min(
    100,
    Math.round(points.length * 1.4)
  );

  return (
    <section className="prototype-interaction">
      <div className="interaction-heading">
        <span className="eyebrow">
          TRY IT
        </span>

        <h2>
          CLEAN THE PAGE.
        </h2>

        <p>
          Mouse or finger.
          Wipe the grime away.
        </p>
      </div>

      <div
        className="window-demo"
        onPointerDown={(event) => {
          setDragging(true);

          event.currentTarget.setPointerCapture(
            event.pointerId
          );

          addPoint(event);
        }}
        onPointerMove={(event) => {
          if (dragging) {
            addPoint(event);
          }
        }}
        onPointerUp={() =>
          setDragging(false)
        }
        onPointerCancel={() =>
          setDragging(false)
        }
      >
        <div className="window-behind">
          <span>
            CLEAN GLASS
          </span>

          <strong>
            PRICING.
            REVIEWS.
            BOOKING.
          </strong>

          <p>
            The real finished page
            lives underneath the dirt.
          </p>

          <a href="tel:+61434052755" className="window-behind-cta">
            BOOK WINDOW CLEANING →
          </a>
        </div>

        <svg
          className="window-grime"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="grime-pattern"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="3"
                r="1.3"
                fill="#aba488"
                opacity="0.45"
              />

              <circle
                cx="8"
                cy="8"
                r="2"
                fill="#5f6459"
                opacity="0.35"
              />

              <path
                d="M0 10 Q4 4 12 7"
                stroke="#d5cfb7"
                strokeWidth="1"
                fill="none"
                opacity="0.25"
              />
            </pattern>

            <mask id="wipe-mask">
              <rect
                width="100"
                height="100"
                fill="white"
              />

              {points.map(
                (point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill="black"
                  />
                )
              )}
            </mask>
          </defs>

          <rect
            width="100"
            height="100"
            fill="#7f8679"
            opacity="0.55"
            mask="url(#wipe-mask)"
          />

          <rect
            width="100"
            height="100"
            fill="url(#grime-pattern)"
            mask="url(#wipe-mask)"
          />
        </svg>
      </div>

      <div className="interaction-status">
        <span>
          {progress}% REVEALED
        </span>

        <button
          onClick={() =>
            setPoints([])
          }
        >
          DIRTY IT AGAIN
        </button>
      </div>
    </section>
  );
}

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
          YOU DO ONE PASS.
        </h2>

        <p>
          Drag the surface cleaner.
          We'll do the actual driveway.
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
        Satisfying, isn't it?
        Even better when you didn't
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
          THIS ONE GETS
          SPECIAL TREATMENT.
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
          PICK HOW OFTEN.
        </h2>

        <p>
          No call-out fee on bin cleaning.
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
          <strong>While we're on site — freshen up the driveway too?</strong>
          <small>
            No extra call-out for this visit. We'll price it and confirm
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

  return (
    <section className="prototype-interaction">
      <div className="interaction-heading">
        <span className="eyebrow">
          SOLAR CALCULATOR
        </span>

        <h2>
          COUNT YOUR PANELS.
        </h2>

        <p>
          $14.50 a panel, flat rate.
          Add your suburb and we'll
          add the local call-out too.
        </p>
      </div>

      <div className="solar-calculator">
        <label className="solar-suburb">
          SUBURB
          <input
            value={suburb}
            onChange={(event) =>
              setSuburb(event.target.value)
            }
            placeholder="e.g. Trinity Beach"
          />
        </label>

        <div className="panel-count">
          <button
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
            CALL-OUT
          </small>

          <strong>
            {suburb === ""
              ? "Enter a suburb"
              : match
                ? match.fee != null
                  ? `$${match.fee.toFixed(2)} (${match.zone})`
                  : `To be confirmed (${match.zone})`
                : "Outside our loaded list — we'll check it"}
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
            The panel rate is confirmed.
            Call-out fees are still being
            loaded suburb by suburb —
            we won't guess one.
          </p>
        </div>
      </div>
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
          EVERYTHING YOU NEED.
          WITHOUT CHASING US.
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
