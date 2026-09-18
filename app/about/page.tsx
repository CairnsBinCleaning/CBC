import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Cairns Bin Cleaning",
  description:
    "Cairns Bin Cleaning is a Cairns-based, ABN-registered, insured exterior cleaning business servicing Cairns and Far North Queensland.",
  alternates: { canonical: "/about" },
};

export default function About() {
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
        <p className="eyebrow dark">WHO’S ACTUALLY DOING THE WORK</p>
        <h1>Local, and answering the phone.</h1>
        <p>
          Cairns Bin Cleaning is a Cairns-based exterior cleaning business —
          bins, pressure cleaning, roofs, windows, solar panels, house
          washing, gutters and commercial sites — servicing Cairns City, the
          Northern Beaches and the southside through to Gordonvale.
        </p>
      </section>

      <section className="legalBody">
        <h2>Who you’re dealing with</h2>
        <p>
          Cairns Bin Cleaning trades under ABN 36 318 413 406, run by Siezar
          Dewaal as a sole trader. GST registered, publicly checkable on the
          Australian Business Register, and carrying public liability
          insurance.
        </p>

        <h2>Real work, not stock photos</h2>
        <p>
          Every photo on this site is a real Cairns job — a real driveway,
          roof, bin or window, not a stock library image standing in for
          one. If a page shows it, it happened.
        </p>

        <h2>Why the pricing is built the way it is</h2>
        <p>
          Bin cleaning is priced completely on its own, with no call-out
          fee. Every other service is the job price plus a call-out for
          your suburb — currently a flat $50 across our three service
          zones. No number gets guessed on the phone and changed later; see{" "}
          <Link href="/faq">FAQ</Link> and{" "}
          <Link href="/service-areas">Service Areas</Link> for exactly how
          that works.
        </p>

        <h2>Who we work with</h2>
        <p>
          Homeowners booking a single job, strata and body corporate
          properties on a recurring schedule, and government or council
          sites that need capability verified before a figure gets quoted.
          See <Link href="/strata">Strata &amp; Body Corporate</Link> or{" "}
          <Link href="/government">Government &amp; Procurement</Link>.
        </p>

        <h2>Get in touch</h2>
        <p>
          Call <a href="tel:+61434052755">0434 052 755</a> or email{" "}
          <a href="mailto:zacsbincleaning@gmail.com">
            zacsbincleaning@gmail.com
          </a>
          .
        </p>
      </section>

      <footer className="legalFooter">
        <span>CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/prices">Prices</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
      </footer>
    </main>
  );
}
