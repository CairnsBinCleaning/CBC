import Link from "next/link";
import { services } from "../lib/services";
import { commercialPages } from "../lib/commercial";
import { suburbPages } from "../lib/suburbs";
import { GOOGLE_REVIEWS } from "../lib/stats";

/* One footer for every page, home included. It carries the business's full
   name, phone, email, hours and area (the same details as the Google
   profile, word for word where it matters), and links every service,
   commercial page and suburb page so none of them sits orphaned.
   Keeps "Created by Siezar DeWaal" (the ABN is added before it by the
   .madeBy CSS). */
export default function SiteFooter({ commercial = false }: { commercial?: boolean }) {
  return (
    <footer className="sf">
      <div className="sf-grid">
        <div className="sf-biz">
          <strong className="sf-name">
            {commercial ? "CBC Exterior & Property Maintenance" : "Cairns Bin Cleaning"}
          </strong>
          {commercial && <span className="sf-sub">A Cairns Bin Cleaning business</span>}
          <p className="sf-tag">For a greener, cleaner FNQ.</p>
          <a href="tel:+61434052755" className="sf-phone">0434 052 755</a>
          <a href="mailto:zacsbincleaning@gmail.com" className="sf-mail">zacsbincleaning@gmail.com</a>
          <p className="sf-meta">
            Open 7 days, 7:30am to 5:30pm
            <br />
            Gordonvale to Palm Cove, Cairns QLD
          </p>
          <a className="sf-reviews" href={GOOGLE_REVIEWS.url} target="_blank" rel="noopener noreferrer">
            <b>{GOOGLE_REVIEWS.rating.toFixed(1)} ★</b> {GOOGLE_REVIEWS.count} Google reviews →
          </a>
        </div>
        <nav className="sf-col" aria-label="Services">
          <span>Home services</span>
          {services
            .filter((s) => s.slug !== "commercial-cleaning")
            .map((s) => (
              <Link key={s.slug} href={`/${s.slug}`}>{s.name}</Link>
            ))}
          <Link href="/instant-quote">Instant quote</Link>
          <Link href="/prices">All prices</Link>
        </nav>
        <nav className="sf-col" aria-label="Commercial">
          <span>Commercial &amp; industrial</span>
          <Link href="/commercial">All commercial services</Link>
          {commercialPages.map((p) => (
            <Link key={p.slug} href={`/commercial/${p.slug}`}>{p.name}</Link>
          ))}
          <Link href="/strata">Strata &amp; body corporate</Link>
          <Link href="/government">Government &amp; councils</Link>
        </nav>
        <nav className="sf-col sf-areas" aria-label="Service areas">
          <span>Areas we cover</span>
          <div>
            {suburbPages.map((p) => (
              <Link key={p.slug} href={`/service-areas/${p.slug}`}>{p.name}</Link>
            ))}
          </div>
          <Link href="/service-areas" className="sf-all">Every suburb we cover →</Link>
        </nav>
      </div>
      <div className="sf-base">
        <nav aria-label="About">
          <Link href="/about">About</Link>
          <Link href="/local-work">Local work</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <small className="madeBy">
          Created by <a href="/faq#siezar-dewaal">Siezar DeWaal</a>
        </small>
      </div>
    </footer>
  );
}
