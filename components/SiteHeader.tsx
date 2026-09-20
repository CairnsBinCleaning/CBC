import Link from "next/link";

/* One header for every inner page (the homepage keeps its photo overlay
   version). Commercial pages show the CBC Exterior & Property Maintenance
   lockup; everything else shows Cairns Bin Cleaning. On phones only the
   brand, phone number and the main button stay (see .nav-extra in CSS). */
export default function SiteHeader({
  commercial = false,
  cta = { href: "/instant-quote", label: "Instant quote" },
}: {
  commercial?: boolean;
  cta?: { href: string; label: string } | null;
}) {
  return (
    <header className="main-header">
      <Link href="/" className="brand">
        {commercial ? (
          <>
            <strong>CBC</strong>
            <span>EXTERIOR &amp; PROPERTY MAINTENANCE</span>
          </>
        ) : (
          <>
            <strong>CAIRNS</strong>
            <span>BIN CLEANING</span>
          </>
        )}
      </Link>
      <nav>
        <Link href="/#services" className="nav-extra">Services</Link>
        <Link href="/prices" className="nav-extra">Prices</Link>
        <Link href="/commercial" className="nav-extra">Commercial</Link>
        <a href="tel:+61434052755">0434 052 755</a>
        {cta && (
          <Link href={cta.href} className="nav-book-btn">
            {cta.label}
          </Link>
        )}
      </nav>
    </header>
  );
}
