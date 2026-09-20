import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy | Cairns Bin Cleaning",
  description:
    "How Cairns Bin Cleaning collects, uses and stores the information you give us when you get a quote or book a clean.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <main className="legalPage">
      <SiteHeader />

      <section className="legalHead">
        <p className="eyebrow dark">PLAIN ENGLISH, NOT LEGALESE</p>
        <h1>Privacy Policy.</h1>
        <p>
          Cairns Bin Cleaning (ABN 36 318 413 406) respects that your name,
          phone number and address are yours, not ours. This page explains
          what we collect when you use this site, why, and what we do with
          it.
        </p>
      </section>

      <section className="legalBody">
        <h2>What we collect</h2>
        <p>
          When you fill in a booking or enquiry form, we collect what you
          type in: your name, phone number, email address (if you give one),
          street address and suburb, and the service or plan you’ve chosen.
          That’s it — we don’t ask for anything beyond what’s needed to
          quote and book the job.
        </p>

        <h2>Website statistics and ads</h2>
        <p>
          This site uses Google Analytics to count which pages people visit,
          and Google Ads conversion tracking to count how many bookings and
          quote requests came from our ads. These use cookies and collect
          general usage information such as the pages viewed, the type of
          device and a rough location. We don&rsquo;t send your name, phone
          number, email or address to Google. You can block these cookies in
          your browser settings or with Google&rsquo;s{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            Analytics opt-out add-on
          </a>
          , and the site still works the same.
        </p>

        <h2>How we use it</h2>
        <p>
          Your details go into Jobber, the scheduling and invoicing software
          we run the business on, so we can quote you accurately, get the
          right crew to the right address, and send an invoice. We don’t use
          your information for anything else, and we don’t sell, rent or
          trade it to anyone.
        </p>

        <h2>Who we share it with</h2>
        <p>
          Jobber Technologies Inc. processes your booking details on our
          behalf as our scheduling and invoicing platform. We don’t hand
          your booking details to any other third party. If a future integration
          changes that, this page will be updated to say exactly who and
          why before it happens.
        </p>

        <h2>How long we keep it</h2>
        <p>
          We keep your details for as long as you’re an active or recurring
          customer, plus the period we’re required to retain records for tax
          purposes under Australian law. If you ask us to delete your
          details and you’re not an active customer, we will.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask us what information we hold about you, ask us to
          correct it, or ask us to delete it, at any time — just call or
          email us using the details below.
        </p>

        <h2>Questions or a request</h2>
        <p>
          Call <a href="tel:+61434052755">0434 052 755</a> or email{" "}
          <a href="mailto:zacsbincleaning@gmail.com">
            zacsbincleaning@gmail.com
          </a>
          .
        </p>

        <p className="legalNote">
          This page describes our actual practices in plain language. It
          isn’t a substitute for professional legal advice, and it’s
          reviewed as the business and this site grow.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
