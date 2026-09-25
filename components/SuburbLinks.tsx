import Link from "next/link";
import { suburbPages } from "../lib/suburbs";

/* Every suburb we cover, linked from every service page. Two jobs: a
   customer sees their own suburb named, and Google gets a clear "this
   service, these places" map of the site. */
export default function SuburbLinks({ service }: { service: string }) {
  return (
    <section className="suburb-links" aria-labelledby="suburb-links-title">
      <h2 id="suburb-links-title">{service} in your suburb</h2>
      <p>
        One price anywhere we cover, from Palm Cove to Gordonvale, with no
        call-out fee. Pick your suburb to see the work we&rsquo;ve done nearest
        to you.
      </p>
      <div className="suburb-chips">
        {suburbPages.map((p) => (
          <Link key={p.slug} href={`/service-areas/${p.slug}`}>
            {p.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
