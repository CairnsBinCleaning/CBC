import Image from "next/image";
import Link from "next/link";
import { commercialPages } from "../lib/commercial";

/* Homepage band that sends business, strata and school visitors to the
   right place in one tap. Photo: our own school roof job in Brinsmead. */
export default function BusinessBand() {
  const links = [
    { href: "/commercial", title: "Commercial & industrial", note: `${commercialPages.length + 1} services, one contractor` },
    { href: "/strata", title: "Strata & body corporate", note: "Common areas, car parks, bin rooms" },
    { href: "/government", title: "Government & schools", note: "Insurance and SWMS ready to send" },
    { href: "/local-work", title: "Recent local work", note: "Real jobs around Cairns" },
  ];
  return (
    <section className="business-band" aria-labelledby="business-band-title">
      <div className="business-band-photo">
        <Image
          src="/media/IMG_3156.jpg"
          alt="Soft washing the metal roofs of a school campus in Brinsmead"
          fill
          sizes="(max-width: 850px) 100vw, 45vw"
          quality={60}
        />
      </div>
      <div className="business-band-copy">
        <p className="eyebrow">BUSINESSES, STRATA &amp; SCHOOLS</p>
        <h2 id="business-band-title">Commercial work, handled properly.</h2>
        <p>
          Bin rooms, car parks, school roofs, commercial kitchens and the
          equipment in them. One contractor, one quote, one invoice. Insured to
          $20 million, WorkCover covered, SWMS supplied.
        </p>
        <div className="business-band-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <strong>{l.title}</strong>
              <small>{l.note}</small>
              <b aria-hidden="true">→</b>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
