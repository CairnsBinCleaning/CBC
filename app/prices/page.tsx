import type { Metadata } from "next";
import Link from "next/link";
import { services } from "../../lib/services";

export const metadata: Metadata = {
  title: "Prices | Cairns Bin Cleaning",
  description:
    "Every Cairns Bin Cleaning price in one plain list — pressure cleaning, bin cleaning, roof cleaning, solar and more.",
  alternates: { canonical: "/prices" },
};

export default function Prices() {
  return (
    <main className="pricesPage">
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
      <section className="pricesHead">
        <p className="eyebrow dark">SKIP THE FLUFF</p>
        <h1>Prices.</h1>
        <p>
          What we can price simply, we show simply. Where access, area or
          site conditions matter, we tell you that too.
        </p>
      </section>
      <section className="priceRows">
        {services.map((s) => (
          <Link key={s.slug} href={"/" + s.slug}>
            <span>{s.name}</span>
            <strong>{s.price}</strong>
            <b>→</b>
          </Link>
        ))}
      </section>
      <p className="priceNote">
        Solar is $14.50 per panel plus a local service call-out — the
        call-out fee depends on your suburb, so give us a call and we'll
        confirm the exact total before we book anything in.
      </p>

      <footer className="service-footer">
        <span>CAIRNS BIN CLEANING</span>
        <nav>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>
    </main>
  );
}
