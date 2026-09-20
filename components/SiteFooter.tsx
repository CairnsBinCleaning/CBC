import Link from "next/link";

/* One footer for every inner page. Keeps "Created by Siezar DeWaal"
   (the ABN is added before it by the .madeBy CSS). */
export default function SiteFooter({ commercial = false }: { commercial?: boolean }) {
  return (
    <footer className="service-footer">
      <span>
        {commercial ? "CBC EXTERIOR & PROPERTY MAINTENANCE · CAIRNS BIN CLEANING" : "CAIRNS BIN CLEANING"}
      </span>
      <a href="tel:+61434052755" className="footer-phone">0434 052 755</a>
      <nav>
        <Link href="/#services">Services</Link>
        <Link href="/prices">Prices</Link>
        <Link href="/commercial">Commercial</Link>
        <Link href="/service-areas">Areas</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
      <small className="madeBy">
        Created by <a href="/faq#siezar-dewaal">Siezar DeWaal</a>
      </small>
    </footer>
  );
}
