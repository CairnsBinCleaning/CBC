"use client";

/* Proof gallery for a service page.

   Kept in its own file on purpose: ServicePageClient.tsx changes often, and a
   standalone component means adding or reordering photos never collides with
   work happening on the booking flow.

   Every photo here is a real Cairns Bin Cleaning job, geotagged in its EXIF to
   the suburb it was shot in. Two frames are only ever shown as a before/after
   pair when they are demonstrably the same job — anything else is shown on its
   own with a caption saying what it is, because presenting two different
   properties as one before/after is a claim the customer can't check. */

import Image from "next/image";

import type { Service, ServicePhoto } from "../lib/services";

const ROLE_LABEL: Record<ServicePhoto["role"], string> = {
  before: "BEFORE",
  after: "AFTER",
  split: "MID-CLEAN",
  action: "ON THE JOB",
};

export default function ServiceGallery({ service }: { service: Service }) {
  if (!service.gallery || service.gallery.length === 0) return null;

  const pairs: [ServicePhoto, ServicePhoto][] = [];
  const singles: ServicePhoto[] = [];
  const seen = new Set<string>();

  for (const photo of service.gallery) {
    if (!photo.pair) {
      singles.push(photo);
      continue;
    }
    if (seen.has(photo.pair)) continue;
    seen.add(photo.pair);

    const group = service.gallery.filter((p) => p.pair === photo.pair);
    const before = group.find((p) => p.role === "before");
    const after = group.find((p) => p.role === "after");

    if (before && after) pairs.push([before, after]);
    else singles.push(...group);
  }

  return (
    <section className="service-gallery" id="our-work">
      <span className="eyebrow">OUR WORK</span>

      <h2>Real jobs, around Cairns.</h2>

      <p className="gallery-intro">
        Every photo below is one of our own jobs, with the suburb it was taken in.
        Before and after are only shown side by side when it is the same job.
      </p>

      {pairs.map(([before, after]) => (
        <div className="gallery-pair" key={before.pair}>
          <GalleryFigure photo={before} />
          <GalleryFigure photo={after} />
        </div>
      ))}

      {singles.length > 0 && (
        <div className="gallery-grid">
          {singles.map((photo) => (
            <GalleryFigure key={photo.src} photo={photo} />
          ))}
        </div>
      )}
    </section>
  );
}

function GalleryFigure({ photo }: { photo: ServicePhoto }) {
  return (
    <figure className={`gallery-figure gallery-${photo.role}`}>
      {/* next/image serves a phone-sized copy to phones instead of the
          full 1600px original. Lazy by default. */}
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes="(max-width: 850px) 100vw, 50vw"
        quality={75}
      />

      <span className="gallery-role">{ROLE_LABEL[photo.role]}</span>

      <figcaption>
        <strong>{photo.suburb}</strong>
        <span>{photo.caption}</span>
      </figcaption>
    </figure>
  );
}
