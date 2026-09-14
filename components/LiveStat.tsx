"use client";

import { useEffect, useRef, useState } from "react";

// The homepage trust stat: a real, fixed number (see lib/stats.ts) that
// plays a one-time count-up reveal when it scrolls into view. The
// animation is decoration on a true figure — it does not tick upward on
// its own afterwards, because nothing here actually tracks cleans in
// real time yet. Making the number appear to move live without a real
// feed behind it would be a false claim, not a nice detail.

export default function LiveStat({ count }: { count: number }) {
  const [display, setDisplay] = useState(count);
  const iconRef = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const node = iconRef.current;
    if (!node) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || hasRun.current) return;
        hasRun.current = true;
        observer.disconnect();

        const start = Math.max(0, count - Math.round(count * 0.02) - 40);
        const duration = 1200;
        let raf = 0;
        let t0 = 0;

        function step(ts: number) {
          if (!t0) t0 = ts;
          const p = Math.min(1, (ts - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(Math.round(start + (count - start) * eased));
          if (p < 1) raf = requestAnimationFrame(step);
        }

        setDisplay(start);
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [count]);

  return (
    <div className="live-stat" ref={iconRef}>
      <svg className="live-stat-icon" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="16" y="22" width="32" height="34" rx="4" fill="#79c51d" />
        <rect x="13" y="16" width="38" height="7" rx="3" fill="#4f7d18" />
        <rect x="24" y="10" width="16" height="6" rx="2" fill="#4f7d18" />
        <rect x="22" y="28" width="3" height="22" rx="1.5" fill="#f4f2eb" opacity=".55" />
        <rect x="31" y="28" width="3" height="22" rx="1.5" fill="#f4f2eb" opacity=".55" />
        <rect x="40" y="28" width="3" height="22" rx="1.5" fill="#f4f2eb" opacity=".55" />
      </svg>
      <div>
        <strong>{display.toLocaleString("en-AU")}</strong>
        <span>bins cleaned, and counting</span>
      </div>
    </div>
  );
}
