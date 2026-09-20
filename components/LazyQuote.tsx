"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps } from "react";

/* The measure-and-quote map is the heaviest thing on a service page (its
   own code, fonts and map tiles). It sits below the hero photo, so it now
   loads once the page has painted and the visitor is near it, instead of
   competing with the first screen. The heading stays in the page from the
   start, and the #instant-quote link still jumps straight to it. */
const QuoteMeasure = dynamic(() => import("./QuoteMeasure"), { ssr: false });

type Props = ComponentProps<typeof QuoteMeasure>;

export default function LazyQuote(props: Props) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (location.hash === "#instant-quote") {
      setShow(true);
      return;
    }
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    /* Wait until the browser is idle after first paint before watching. */
    const start = () => io.observe(node);
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start);
    else setTimeout(start, 200);
    const onHash = () => location.hash === "#instant-quote" && setShow(true);
    window.addEventListener("hashchange", onHash);
    return () => {
      io.disconnect();
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  if (show) return <QuoteMeasure {...props} />;
  return (
    <section ref={ref} id="instant-quote" className="quote-placeholder" aria-busy="true">
      <p className="eyebrow">INSTANT SATELLITE QUOTE</p>
      <h2>{props.heading}</h2>
      <p>{props.intro}</p>
      <button type="button" className="quote-placeholder-btn" onClick={() => setShow(true)}>
        Open the map
      </button>
    </section>
  );
}
