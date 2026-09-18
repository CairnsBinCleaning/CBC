import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | Cairns Bin Cleaning",
  description:
    "Suburb fees, bin cleaning prices, solar panel cleaning rates, service areas, cancellation policy and insurance — answered plainly.",
  alternates: { canonical: "/faq" },
};

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "What areas does Cairns Bin Cleaning service?",
    a: (
      <>
        Cairns City and the central suburbs, the Northern Beaches from
        Machans Beach up to Ellis Beach, and the southside through to
        Gordonvale. See the full suburb list on{" "}
        <Link href="/service-areas">Service Areas</Link>.
      </>
    ),
  },
  {
    q: "Is there an extra fee for my suburb?",
    a: (
      <>
        Every service except bin cleaning has a small visit fee added for
        your suburb — currently a flat $50 across all three of our service
        zones. Bin cleaning has nothing added at all; it’s priced completely
        on its own.
      </>
    ),
  },
  {
    q: "How much does bin cleaning cost?",
    a: (
      <>
        Two standard 240L bins: $35.95 fortnightly, $39.95 every four weeks,
        or $74.95 for a one-off clean. Recurring plans run on a
        three-service minimum. See{" "}
        <Link href="/bin-cleaning">Bin Cleaning</Link> to book online.
      </>
    ),
  },
  {
    q: "How much does solar panel cleaning cost?",
    a: (
      <>
        $14.50 per panel, plus a visit fee for your suburb. Enter your
        panel count on the{" "}
        <Link href="/solar-panel-cleaning">Solar Panel Cleaning</Link> page
        for an instant subtotal.
      </>
    ),
  },
  {
    q: "What’s your cancellation policy?",
    a: (
      <>
        We ask for at least 24 hours’ notice to cancel or reschedule. Less
        notice than that, or a missed appointment, may incur a fee for the
        wasted visit — we’ll always discuss it with you first. Full detail on{" "}
        <Link href="/terms">Terms &amp; Cancellation</Link>.
      </>
    ),
  },
  {
    q: "Are you insured?",
    a: (
      <>
        Yes. Cairns Bin Cleaning carries public liability insurance and
        operates under ABN 36 318 413 406.
      </>
    ),
  },
  {
    q: "Do you work with strata, body corporate and government sites?",
    a: (
      <>
        Yes — strata and body corporate maintenance, and government or
        council procurement work. See{" "}
        <Link href="/strata">Strata &amp; Body Corporate</Link> or{" "}
        <Link href="/government">Government &amp; Procurement</Link>.
      </>
    ),
  },
  {
    q: "What happens if it rains on my booking day?",
    a: (
      <>
        If wet season conditions make a job unsafe or pointless, we
        reschedule at no extra cost — that’s on us, not you.
      </>
    ),
  },
  {
    q: "How do I book?",
    a: (
      <>
        Call <a href="tel:+61434052755">0434 052 755</a>, or book bin
        cleaning and get a solar estimate directly online from their
        service pages.
      </>
    ),
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What areas does Cairns Bin Cleaning service?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cairns City and the central suburbs, the Northern Beaches from Machans Beach up to Ellis Beach, and the southside through to Gordonvale.",
      },
    },
    {
      "@type": "Question",
      name: "Is there an extra fee for my suburb?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every service except bin cleaning has a small visit fee added for your suburb — currently a flat $50 across all three of our service zones. Bin cleaning has nothing added at all.",
      },
    },
    {
      "@type": "Question",
      name: "How much does bin cleaning cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Two standard 240L bins: $35.95 fortnightly, $39.95 every four weeks, or $74.95 for a one-off clean. Recurring plans run on a three-service minimum.",
      },
    },
    {
      "@type": "Question",
      name: "How much does solar panel cleaning cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "$14.50 per panel, plus a visit fee for your suburb.",
      },
    },
    {
      "@type": "Question",
      name: "What’s your cancellation policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We ask for at least 24 hours’ notice to cancel or reschedule a booked visit. Less notice may incur a fee for the wasted visit.",
      },
    },
    {
      "@type": "Question",
      name: "Are you insured?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Cairns Bin Cleaning carries public liability insurance and operates under ABN 36 318 413 406.",
      },
    },
    {
      "@type": "Question",
      name: "Do you work with strata, body corporate and government sites?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — strata and body corporate maintenance, and government or council procurement work.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if it rains on my booking day?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If wet season conditions make a job unsafe or pointless, we reschedule at no extra cost.",
      },
    },
    {
      "@type": "Question",
      name: "How do I book?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Call 0434 052 755, or book bin cleaning and get a solar estimate directly online from their service pages.",
      },
    },
  ],
};

export default function FAQ() {
  return (
    <main className="legalPage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

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
        <p className="eyebrow dark">QUESTIONS, ANSWERED PLAINLY</p>
        <h1>FAQ.</h1>
        <p>
          The things people actually ask before booking — suburb fees,
          prices, areas and what happens if the weather doesn’t cooperate.
        </p>
      </section>

      <section className="faq-list">
        {faqs.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>

      <footer className="legalFooter">
        <span>CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/prices">Prices</Link>
          <Link href="/service-areas">Areas</Link>
        </nav>
      </footer>
    </main>
  );
}
