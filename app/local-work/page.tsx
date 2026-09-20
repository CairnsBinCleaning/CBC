import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import { localJobs } from "../../lib/localWork";

export const metadata: Metadata = {
  title: "Local Work Around Cairns | Cairns Bin Cleaning",
  description:
    "Real jobs we've done for schools, apartment complexes and businesses around Cairns: roofs, car parks, walkways and refuse rooms, with our own photos.",
  alternates: { canonical: "/local-work" },
};

export default function LocalWork() {
  return (
    <main className="legalPage">
      <SiteHeader />

      <section className="segmentHero">
        <h1>
          <span className="eyebrow dark" style={{ display: "block", lineHeight: 1.5, marginBottom: 12 }}>
            LOCAL WORK AROUND CAIRNS
          </span>
          Jobs we&rsquo;ve done for the places Cairns people use every day.
        </h1>
        <p>
          Schools, apartment complexes, shopfronts and refuse rooms. Every photo is from the job it sits under. We only name a
          client once they&rsquo;ve said we can.
        </p>
      </section>

      {localJobs.map((job) => {
        const named = job.permission && job.client;
        return (
          <section key={job.id} className="legalBody" id={job.id}>
            <h2>
              {named ? job.client!.name : job.title}
              {named && <small style={{ display: "block", fontSize: 15, fontWeight: 400 }}>{job.suburb}</small>}
            </h2>
            <p>
              <strong>{job.when}.</strong> {job.note}
            </p>
            <ul>
              {job.work.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            {named && job.client!.url && (
              <p>
                <a href={job.client!.url} target="_blank" rel="noopener">
                  Visit {job.client!.name} →
                </a>
              </p>
            )}
            <div className="commercial-photos" style={{ padding: 0, margin: "16px 0 0" }}>
              {job.photos.map((ph) => (
                <figure key={ph.src}>
                  <Image src={ph.src} alt={ph.alt} width={ph.width} height={ph.height} sizes="(max-width: 850px) 100vw, 33vw" quality={65} />
                  <figcaption>Our work, {job.suburb}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        );
      })}

      <section className="legalBody">
        <h2>Want your site looked after?</h2>
        <p>
          Schools, clubs, body corporates and businesses: <Link href="/commercial">see what we do for commercial sites</Link>{" "}
          or call <a href="tel:+61434052755">0434 052 755</a>.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
