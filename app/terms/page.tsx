import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Cancellation Policy | Cairns Bin Cleaning",
  description:
    "Booking terms, pricing basis and cancellation policy for Cairns Bin Cleaning’s residential and commercial services.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <main className="legalPage">
      <header className="nav navLight">
        <Link href="/" className="brand">
          <span>CAIRNS</span>
          <small>BIN CLEANING</small>
        </Link>
        <nav>
          <Link href="/">Home</Link>
          <a href="tel:+61434052755">0434 052 755</a>
        </nav>
      </header>

      <section className="legalHead">
        <p className="eyebrow dark">WHAT YOU’RE AGREEING TO</p>
        <h1>Terms &amp; Cancellation.</h1>
        <p>
          Booking a service with Cairns Bin Cleaning (ABN 36 318 413 406)
          means agreeing to the terms below. Written so you’d actually
          understand them before you book, not just after something’s gone
          wrong.
        </p>
      </section>

      <section className="legalBody">
        <h2>How pricing works</h2>
        <p>
          Bin cleaning is priced as a fixed fee — nothing added.
          Every other service on this site is priced as the job itself plus
          a visit fee for your suburb. Solar panel cleaning is $14.50 per
          panel plus the same visit fee. Any price shown on this site is an
          estimate until we’ve confirmed access, area and site conditions
          with you directly — we’ll always tell you the final figure before
          the work starts, not after.
        </p>

        <h2>Recurring bin cleaning plans</h2>
        <p>
          Fortnightly and four-weekly bin cleaning plans run on a
          three-service minimum. That means once you start a recurring
          plan, it runs for at least three cleans before it can be cancelled
          without a break fee. One-off bin cleans have no minimum — it’s a
          single visit, once.
        </p>

        <h2>Bin access on cleaning day</h2>
        <p>
          For bin cleaning, it’s your responsibility to have your bin out on
          the curb and accessible until 7pm on the scheduled day. If we
          arrive and the bin isn’t out, we can’t clean it — but the visit
          still costs us the same fuel, vehicle time and labour as a
          completed job, so the scheduled service is still charged,
          including a recurring subscription clean. There’s no separate
          “no-show fee” — it’s simply that a missed bin is treated as a
          completed visit for billing purposes, the same as any other job we
          turn up for. If your bin needs to sit somewhere other than the
          curb, let us know in advance and we’ll work around it.
        </p>

        <h2>Cancelling or rescheduling a booking</h2>
        <p>
          We ask for at least 24 hours’ notice to cancel or reschedule a
          booked visit. Less notice than that, or a missed appointment with
          no notice at all, may incur a fee to cover the time
          already allocated to your job — we’ll always discuss this with
          you directly rather than silently charge it.
        </p>

        <h2>Access and site conditions</h2>
        <p>
          We need reasonable access to the area being cleaned — gates
          unlocked, pets secured, and the property accessible at the booked
          time. If we arrive and can’t safely access the site, that’s
          treated the same as a late cancellation.
        </p>

        <h2>Weather</h2>
        <p>
          Far North Queensland weather doesn’t always cooperate. If wet
          season conditions make a job unsafe or pointless (there’s no point
          pressure cleaning a driveway mid-downpour), we’ll reschedule at no
          extra cost — that’s on us, not you.
        </p>

        <h2>Payment</h2>
        <p>
          Invoicing and payment are handled through Jobber. Payment terms
          are confirmed with you at the time of booking or on the invoice
          itself.
        </p>

        <h2>Liability</h2>
        <p>
          We carry public liability insurance and work to a standard we’d
          be comfortable inspecting ourselves. If something genuinely goes
          wrong on our side, tell us directly and we’ll sort it — that’s
          simpler and faster for both of us than anything formal.
        </p>

        <h2>Questions</h2>
        <p>
          Call <a href="tel:+61434052755">0434 052 755</a> or email{" "}
          <a href="mailto:zacsbincleaning@gmail.com">
            zacsbincleaning@gmail.com
          </a>{" "}
          before you book if anything here needs clarifying.
        </p>

        <p className="legalNote">
          These terms describe how the business actually operates. They’re
          reviewed as the business grows, and don’t replace professional
          legal advice for anything unusual or high-value.
        </p>
      </section>

      <footer className="legalFooter">
        <span>CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/service-areas">Areas</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About</Link>
          <Link href="/prices">Prices</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </footer>
    </main>
  );
}
