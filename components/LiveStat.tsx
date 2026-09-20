"use client";

import { useEffect, useRef, useState } from "react";
import { lifetimeBinCleans } from "../lib/stats";

// The homepage trust stat: Siezar's real lifetime count plus his stated
// ~500 a week since it was taken (lib/stats.ts). Recomputed in the browser
// so a page built last week still shows this week's figure, then plays a
// one-time count-up when it scrolls into view.

export default function LiveStat({ count: built }: { count: number }) {
  const [count, setCount] = useState(built);
  const [display, setDisplay] = useState(built);

  useEffect(() => {
    const now = lifetimeBinCleans();
    setCount(now);
    setDisplay(now);
  }, []);
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
