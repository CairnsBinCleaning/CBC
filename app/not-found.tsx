import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import TrustBar from "../components/TrustBar";

export const metadata: Metadata = {
  title: "Page not found | Cairns Bin Cleaning",
  robots: { index: false },
};

/* A friendly dead end: people arriving from an old link (the old Zac's
   site, an old Facebook post) still get somewhere useful in one tap. */
export default function NotFound() {
  return (
    <main className="legalPage">
      <SiteHeader />
      <section className="legalHead">
        <p className="eyebrow dark">PAGE NOT FOUND</p>
        <h1>That page has moved.</h1>
        <p>
          You might have followed an old link. Everything is still here: pick
          what you need below, or call <a href="tel:+61434052755">0434 052 755</a>.
        </p>
        <TrustBar />
      </section>
      <section className="areas-services">
        <div className="areas-service-grid">
          <Link href="/instant-quote"><strong>Get an instant price</strong><small>Measure it on the map</small></Link>
          <Link href="/bin-cleaning"><strong>Bin cleaning</strong><small>From $35.95</small></Link>
          <Link href="/pressure-cleaning"><strong>Pressure cleaning</strong><small>From $2.95/m²</small></Link>
          <Link href="/roof-cleaning"><strong>Roof cleaning</strong><small>Soft wash</small></Link>
          <Link href="/commercial"><strong>Commercial &amp; industrial</strong><small>Walkthrough and written quote</small></Link>
          <Link href="/prices"><strong>All prices</strong><small>One plain list</small></Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
