"use client";

import { useEffect, useState } from "react";

// A thin, "Google-doodle quiet" strip above the header: one line of copy
// and a light colour tint for whatever's actually happening in the
// calendar right now. Nothing else on the page moves.
//
// Every date below is a real one — fixed national/QLD public holidays,
// the two moveable QLD ones (Labour Day, King's Birthday — both always
// the first Monday of their month), and the FNQ wet season window that
// actually drives demand for driveway and roof cleaning here. Nothing is
// guessed the way lib/pricing.ts never guesses a call-out fee.
//
// Computed client-side from the visitor's own clock so the banner never
// goes stale between deploys — it renders nothing until that first
// effect runs, which is a deliberate trade for never showing the wrong
// day's banner.

type BannerContent = {
  key: string;
  text: string;
  tint: string;
};

function firstMondayOf(year: number, monthIndex0: number): Date {
  const d = new Date(year, monthIndex0, 1);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday
  const offset = day === 1 ? 0 : (8 - day) % 7;
  d.setDate(1 + offset);
  return d;
}

function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DEFAULT_BANNER: BannerContent = {
  key: "default",
  text: "For a greener, cleaner FNQ — bins, driveways and roofs, done properly.",
  tint: "rgba(121,197,29,.08)",
};

function computeBanner(now: Date): BannerContent {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const date = now.getDate();

  if (month === 11 && date >= 15 && date <= 25) {
    return {
      key: "christmas",
      text: "Book before the 25th — we'll fit you in before the family arrives.",
      tint: "rgba(121,197,29,.14)",
    };
  }

  if ((month === 11 && date >= 26) || (month === 0 && date <= 7)) {
    return {
      key: "new-year",
      text: `New year, clean start. Lock in your first clean of ${month === 0 ? year : year + 1}.`,
      tint: "rgba(121,197,29,.14)",
    };
  }

  if (month === 0 && date === 26) {
    return {
      key: "australia-day",
      text: "Australia Day long weekend — we're still on the road.",
      tint: "rgba(166,240,82,.16)",
    };
  }

  if (month === 3 && date === 25) {
    return {
      key: "anzac-day",
      text: "ANZAC Day — lest we forget. Normal bookings still running.",
      tint: "rgba(166,240,82,.16)",
    };
  }

  if (isSameDate(now, firstMondayOf(year, 4))) {
    return {
      key: "labour-day",
      text: "Labour Day long weekend — we're still on the road.",
      tint: "rgba(166,240,82,.16)",
    };
  }

  if (isSameDate(now, firstMondayOf(year, 9))) {
    return {
      key: "kings-birthday",
      text: "King's Birthday long weekend — we're still on the road.",
      tint: "rgba(166,240,82,.16)",
    };
  }

  // FNQ wet season: roughly November through April.
  if (month >= 10 || month <= 3) {
    return {
      key: "wet-season",
      text: "Wet season grime doesn't wait. Neither should your driveway.",
      tint: "rgba(47,127,176,.10)",
    };
  }

  return DEFAULT_BANNER;
}

export default function SeasonalBanner() {
  const [banner, setBanner] = useState<BannerContent | null>(null);

  useEffect(() => {
    setBanner(computeBanner(new Date()));
  }, []);

  if (!banner) return null;

  return (
    <div className="seasonal-banner" style={{ background: banner.tint }} data-banner={banner.key}>
      <p>{banner.text}</p>
    </div>
  );
}
