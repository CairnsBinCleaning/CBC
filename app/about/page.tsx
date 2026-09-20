import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import TrustBar from "../../components/TrustBar";
import OwnerNote from "../../components/OwnerNote";
import { crumbs } from "../../lib/breadcrumbs";

export const metadata: Metadata = {
  title: "About Us | Local Cairns Cleaning, Owner Siezar DeWaal",
  description:
    "Meet Siezar DeWaal, owner of Cairns Bin Cleaning: ex-chef, local Cairns business, $20M insured, 5.0 stars from 40 Google reviews. Pay after the job.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <main className="legalPage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(crumbs([["About", "/about"]])).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />

      <section className="legalHead">
        <p className="eyebrow dark">ABOUT CAIRNS BIN CLEANING</p>
        <h1>Local, insured, and answering the phone.</h1>
        <p>
          Cairns Bin Cleaning is a Cairns exterior cleaning business: bins,
          pressure cleaning, roofs, windows, solar panels, house washing,
          gutters, and commercial and industrial sites, from Gordonvale to
          Palm Cove.
        </p>
        <TrustBar />
      </section>

      <OwnerNote full />

      <section className="legalBody">
        <h2>Who you&rsquo;re dealing with</h2>
        <p>
          Cairns Bin Cleaning trades under ABN 36 318 413 406, run by Siezar
          DeWaal as a sole trader, and trades as CBC Exterior &amp; Property
          Maintenance for commercial work. GST registered and publicly
          checkable on the Australian Business Register. Insured for $20
          million public liability, covered by WorkCover Queensland, with a
          safe work method statement for site work.
        </p>

        <h2>How we price</h2>
        <p>
          One price anywhere we cover, from Palm Cove to Gordonvale. No
          call-out fee, nothing paid up front, and the price you see before
          we start is the price you pay. Bin cleaning has its own set plans.
          See the <Link href="/prices">price list</Link> or measure your own
          job on the <Link href="/instant-quote">instant quote</Link>.
        </p>

        <h2>Real work, not stock photos</h2>
        <p>
          Every photo on this site is a real Cairns job: a real driveway,
          roof, bin room or car park, not a stock image standing in for one.
          If a page shows it, it happened. Some of it is on our{" "}
          <Link href="/local-work">local work</Link> page.
        </p>

        <h2>Who we work with</h2>
        <p>
          Homeowners booking a single job, strata and body corporate
          properties on a recurring schedule, schools, businesses, and
          government or council sites that need insurance and paperwork
          checked before a figure is quoted. See{" "}
          <Link href="/commercial">Commercial &amp; industrial</Link>,{" "}
          <Link href="/strata">Strata &amp; body corporate</Link> or{" "}
          <Link href="/government">Government &amp; procurement</Link>.
        </p>

        <h2>Get in touch</h2>
        <p>
          Call <a href="tel:+61434052755">0434 052 755</a> or email{" "}
          <a href="mailto:zacsbincleaning@gmail.com">zacsbincleaning@gmail.com</a>.
          Open 7 days, 7:30am to 5:30pm.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
