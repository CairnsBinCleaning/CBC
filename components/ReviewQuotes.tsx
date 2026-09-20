import { GOOGLE_REVIEWS, reviewsFor } from "../lib/stats";

/* Real Google review quotes (lib/stats.ts), linked back to the listing so
   anyone can check them. Renders nothing if a page has none. */
export default function ReviewQuotes({ slug, dark = false }: { slug: string; dark?: boolean }) {
  const quotes = reviewsFor(slug);
  if (!quotes.length) return null;
  return (
    <section className={`review-quotes${dark ? " dark" : ""}`} aria-label="Google reviews">
      <div className="review-quotes-head">
        <b>{GOOGLE_REVIEWS.rating.toFixed(1)} ★</b>
        <span>from {GOOGLE_REVIEWS.count} Google reviews</span>
        <a href={GOOGLE_REVIEWS.url} target="_blank" rel="noopener noreferrer">
          Read them all →
        </a>
      </div>
      <div className="review-quotes-grid">
        {quotes.map((r) => (
          <figure key={r.name}>
            <blockquote>“{r.text}”</blockquote>
            <figcaption>
              {r.name} · Google review · {r.when}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
