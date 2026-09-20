import Link from "next/link";
import Image from "next/image";
import { GOOGLE_REVIEWS, LIFETIME_BIN_CLEANS } from "../lib/stats";

/* The human behind the business. People book people: a named owner, what
   he did before, and how he works. Facts only (Siezar, 20 Sept 2026):
   owner-operator, 13 years as a chef, the "do it properly" line is his own.
   When there's a real photo of Siezar, set OWNER_PHOTO and it shows. */
const OWNER_PHOTO: { src: string; alt: string } | null = null;

export default function OwnerNote({ full = false }: { full?: boolean }) {
  return (
    <section className="owner-note" aria-labelledby="owner-note-title">
      <div className="owner-note-card">
        <div className="owner-portrait" aria-hidden={OWNER_PHOTO ? undefined : true}>
          {OWNER_PHOTO ? (
            <Image src={OWNER_PHOTO.src} alt={OWNER_PHOTO.alt} fill sizes="160px" />
          ) : (
            <span>SD</span>
          )}
        </div>
        <div className="owner-copy">
          <p className="eyebrow dark">WHO TURNS UP</p>
          <h2 id="owner-note-title">A local business, not a call centre.</h2>
          <p>
            G&rsquo;day, I&rsquo;m Siezar, and I run Cairns Bin Cleaning. Before
            this I spent 13 years as a chef, where clean isn&rsquo;t a look,
            it&rsquo;s a standard. That&rsquo;s how we work on your place now.
          </p>
          <p>
            You see the price before we start. You pay after the job, not
            before. And the work is guaranteed, because the whole point is to{" "}
            <em>do it properly so you don&rsquo;t have to do it again.</em>
          </p>
          {full && (
            <p>
              When you call, you&rsquo;re talking to the people who do the
              work. The person who quotes it is the person who turns up.
            </p>
          )}
          <p className="owner-sign">
            Siezar DeWaal <span>Owner, Cairns Bin Cleaning</span>
          </p>
          {full && (
          <ul className="owner-facts">
            {LIFETIME_BIN_CLEANS != null && (
              <li>
                <b>{LIFETIME_BIN_CLEANS.toLocaleString("en-AU")}</b> bins cleaned
              </li>
            )}
            <li>
              <b>{GOOGLE_REVIEWS.rating.toFixed(1)} ★</b> from {GOOGLE_REVIEWS.count} Google reviews
            </li>
            <li>
              <b>7 days</b> 7:30am to 5:30pm
            </li>
          </ul>
          )}
          {!full && (
            <Link href="/about" className="owner-more">
              More about us →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
