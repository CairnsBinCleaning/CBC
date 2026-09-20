import type { Metadata } from "next";
import Link from "next/link";
import { GUTTER, QUOTE_CONFIG, ROOF_MATERIALS, WINDOW_RATES } from "../../lib/quote";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "FAQ | Cairns Bin Cleaning",
  description:
    "Cairns prices for driveways, roofs, house washing, gutters, windows, solar and bins, one price in every suburb, areas, cancellations and insurance, answered plainly.",
  alternates: { canonical: "/faq" },
};

/* One list feeds both the page and the FAQPage schema, so what Google reads
   is exactly what people read. Every price comes from lib/quote.ts and
   lib/pricing.ts. */
const [METAL, TILE] = ROOF_MATERIALS;
const faqs: { q: string; text: string; link?: { href: string; label: string }; id?: string }[] = [
  {
    q: "What areas does Cairns Bin Cleaning service?",
    text: "Cairns City and the central suburbs, the Northern Beaches from Machans Beach up to Ellis Beach, and the southside through to Gordonvale.",
    link: { href: "/service-areas", label: "See the full suburb list" },
  },
  {
    q: "Is there an extra fee for my suburb?",
    text: "No. There's no call-out fee and no suburb charge: the same price from Palm Cove to Gordonvale. The price you see for your address is the price you pay.",
    link: { href: "/terms", label: "Full detail in our terms" },
  },
  {
    q: "Do I pay up front?",
    text: `No. You pay after the job's done. Book your next clean before this one, or before we leave the site, and the next one is ${Math.round(QUOTE_CONFIG.rebookDiscount * 100)}% off.`,
  },
  {
    q: "Do you clean asbestos or fibro roofs?",
    text: "No. We soft wash metal and tile roofs only. If you're not sure what your roof is, pick “Not sure” in the instant quote and we'll check it before quoting.",
    link: { href: "/roof-cleaning", label: "Roof cleaning" },
  },
  {
    q: "Is there a minimum charge?",
    text: `Every job starts from $${QUOTE_CONFIG.minTotal}, GST included. Bin cleaning has its own prices and isn't affected.`,
  },
  {
    q: "How much does bin cleaning cost?",
    text: "Two standard 240L bins: $35.95 fortnightly, $39.95 every four weeks, or $74.95 for a one-off clean. Recurring plans run on a three-service minimum.",
    link: { href: "/bin-cleaning", label: "Book bin cleaning online" },
  },
  {
    q: "How much does driveway or pressure cleaning cost?",
    text: `Driveways and concrete are $2.95/m² ($2.45/m² past 200 m²), patios and pool surrounds $3.45/m². A 100 m² driveway is $295. Mould inhibitor is $${QUOTE_CONFIG.inhibitorPerM2.toFixed(2)}/m² extra if you want it.`,
    link: { href: "/instant-quote", label: "Measure yours for an instant price" },
  },
  {
    q: "How much does roof cleaning cost?",
    text: `We soft wash roofs. Metal is $${METAL.rate.toFixed(2)}/m² (from $${METAL.min}), tile $${TILE.rate.toFixed(2)}/m² (from $${TILE.min}), priced on the real roof area with the slope added. We don't clean asbestos or fibro roofs.`,
    link: { href: "/roof-cleaning", label: "Measure your roof" },
  },
  {
    q: "How much does house washing cost?",
    text: "$3.30/m² of wall ($2.40/m² past 150 m²). A single-storey house starts at $429; double storey is usually $650 to $800.",
    link: { href: "/house-washing", label: "Measure your house" },
  },
  {
    q: "How much does gutter cleaning cost?",
    text: `$${GUTTER.base[1]} single storey or $${GUTTER.base[2]} double storey for the first ${GUTTER.includedM} m of gutter, then $${GUTTER.perExtraM} a metre. Downpipes flushed, included.`,
    link: { href: "/gutter-cleaning", label: "Measure your gutters" },
  },
  {
    q: "How much does window cleaning cost?",
    text: `$${WINDOW_RATES.outside.toFixed(2)} a pane outside only, or $${WINDOW_RATES.both.toFixed(2)} a pane inside and out.`,
    link: { href: "/window-cleaning", label: "Count your panes for a price" },
  },
  {
    q: "How much does solar panel cleaning cost?",
    text: "$14.50 per panel, jobs from $179. Count your panels on the solar page for your exact total.",
    link: { href: "/solar-panel-cleaning", label: "Enter your panel count" },
  },
  {
    q: "What's your cancellation policy?",
    text: "We ask for at least 24 hours' notice to cancel or reschedule. Less notice than that, or a missed appointment, may incur a fee for the wasted visit. We'll always discuss it with you first.",
    link: { href: "/terms", label: "Terms & cancellation" },
  },
  {
    q: "Are you insured?",
    text: "Yes. $20 million public liability, WorkCover Queensland, and a written safe work method statement. ABN 36 318 413 406. Commercial clients can download the certificates.",
    link: { href: "/commercial-cleaning", label: "See the documents" },
  },
  {
    q: "Do you work with strata, body corporate and government sites?",
    text: "Yes: strata and body corporate maintenance, and government or council procurement work.",
    link: { href: "/strata", label: "Strata & body corporate" },
  },
  {
    q: "What happens if it rains on my booking day?",
    text: "If wet season conditions make a job unsafe or pointless, we reschedule at no extra cost. That's on us, not you.",
  },
  {
    q: "Who built this website?",
    text: "Siezar DeWaal, who owns and runs Cairns Bin Cleaning, designed and built it: the instant quote map that measures your driveway or roof from aerial photos, the typo-proof Cairns address search, online booking straight into our job system, and every page you're reading. Siezar also builds, fixes and streamlines websites, booking systems and quoting tools for other local businesses. If you want something like this for yours, call 0434 052 755.",
    id: "siezar-dewaal",
  },
  {
    q: "How do I book?",
    text: "Bins and solar book online on their pages. Driveways, roofs, houses and gutters: measure it on the instant quote map and accept the price. Windows: count your panes on the window page. Or call 0434 052 755.",
    link: { href: "/instant-quote", label: "Open the instant quote" },
  },
];

/* So a search for Siezar's name finds him, and what he built. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://www.cairnsbincleaning.com.au/faq#siezar-dewaal",
  name: "Siezar DeWaal",
  jobTitle: "Owner, Cairns Bin Cleaning; website and booking-system developer",
  worksFor: { "@type": "LocalBusiness", "@id": "https://www.cairnsbincleaning.com.au/#business", name: "Cairns Bin Cleaning", url: "https://www.cairnsbincleaning.com.au" },
  address: { "@type": "PostalAddress", addressLocality: "Cairns", addressRegion: "QLD", addressCountry: "AU" },
  telephone: "+61434052755",
  url: "https://www.cairnsbincleaning.com.au/faq#siezar-dewaal",
  knowsAbout: ["Web development", "Next.js", "Booking systems", "Online quoting tools", "Local SEO", "Exterior cleaning"],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.text },
  })),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <SiteHeader />

      <section className="legalHead">
        <p className="eyebrow dark">QUESTIONS, ANSWERED PLAINLY</p>
        <h1>FAQ.</h1>
        <p>
          The things people actually ask before booking: prices, areas,
          insurance and what happens if the weather doesn’t cooperate.
        </p>
      </section>

      <section className="faq-list">
        {faqs.map((item) => (
          <details key={item.q} className="faq-item" id={item.id}>
            <summary>{item.q}</summary>
            <p>
              {item.text}
              {item.link && (
                <>
                  {" "}
                  <Link href={item.link.href}>{item.link.label} →</Link>
                </>
              )}
            </p>
          </details>
        ))}
      </section>

      <SiteFooter />
    </main>
  );
}
