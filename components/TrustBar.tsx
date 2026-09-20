import { GOOGLE_REVIEWS } from "../lib/stats";

/* The insurance chip links to /about#check-us, where the certificates are. */

/* The five reasons people feel safe booking, said once, right where they
   decide. Every item is a confirmed fact (lib/stats.ts, the insurance
   certificate, and Siezar's own terms: pay after the job, no call-out fee,
   work guaranteed). Add nothing here that isn't true. */
export default function TrustBar({ dark = false }: { dark?: boolean }) {
  return (
    <ul className={`trust-bar${dark ? " dark" : ""}`} aria-label="Why people book with us">
      <li>
        <a href={GOOGLE_REVIEWS.url} target="_blank" rel="noopener noreferrer">
          <b>{GOOGLE_REVIEWS.rating.toFixed(1)} ★</b> {GOOGLE_REVIEWS.count} Google reviews
        </a>
      </li>
      <li>Local Cairns business</li>
      <li>
        <a href="/about#check-us">$20M insured</a>
      </li>
      <li>No call-out fee</li>
      <li>Pay after the job</li>
    </ul>
  );
}
