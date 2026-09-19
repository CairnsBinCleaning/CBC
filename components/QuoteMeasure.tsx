"use client";

/* Instant satellite quote.
 *
 * Customer finds their place on aerial imagery, taps the corners of what
 * needs cleaning, and gets a real price. Accepting it runs the same Server
 * Action path every other booking on this site uses.
 *
 * Deliberate choices:
 *  - Imagery is the Queensland Government's own aerial photography (free,
 *    CC BY 4.0, survey-corrected, about 15 cm a pixel over Cairns), drawn
 *    with Leaflet. No Google account, no billing, no watermark. Always
 *    straight down and north-up — a tilted view can't be measured honestly.
 *  - Measuring never depends on the imagery: the tool records the real
 *    lat/lng of every tap and lib/quote.ts works out the area from those.
 *  - Address search is our own copy of the national address file
 *    (/api/address, lib/addressSearch.ts) so it knows every Cairns house
 *    number. Anything outside that list falls back to OpenStreetMap.
 *  - All geometry and pricing live in lib/quote.ts so the server recomputes
 *    the total from raw coordinates. Nothing the browser claims a job costs
 *    is ever trusted.
 *  - The map is driven imperatively through refs. React owns the panel, the
 *    map owns the shape — mixing them re-renders the tree on every drag.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import "leaflet/dist/leaflet.css";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";

import styles from "./QuoteMeasure.module.css";

import {
  QUOTE_CONFIG,
  QUOTE_SERVICES,
  billableFor,
  distanceKm,
  edgeLengths,
  explainLine,
  getQuoteService,
  money,
  perimeter,
  polygonArea,
  priceShape,
  ROOF_MATERIALS,
  shapePrice,
  quoteTotals,
  scaleComparison,
  snapRightAngle,
  type LatLng,
  type QuoteLine,
} from "../lib/quote";

import { bookMeasuredQuote, type BookMeasuredQuoteResult } from "../lib/jobber/actions";
import { pct, zoneFromAddress } from "../lib/pricing";
import { useLeadEvent } from "./Analytics";

const MAX_PHOTOS = 3;

/* Queensland Government aerial imagery, pre-cut tiles, passed through our
   own /api/tiles so Vercel's edge caches them (see that route). Sharp to
   zoom 20; Leaflet enlarges that for 21–22 so corners land precisely. */
const IMAGERY_URL = "/api/tiles/{z}/{y}/{x}";
const IMAGERY_CREDIT =
  'Imagery © State of Queensland (DNRMMRRD), <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a> · Addresses: G-NAF © Geoscape Australia';

/* Centred marker: a zero-size Leaflet icon whose child is shifted back by
   half its own size, so the dot's centre sits exactly on the coordinate. */
function dotIcon(L: any, className: string, html = "") {
  return L.divIcon({ className: "cbc-anchor", html: `<div class="${className}">${html}</div>`, iconSize: [0, 0] });
}

type Address = { label: string; lat: number | null; lng: number | null };
type Draw = { count: number; area: number; perim: number };
const EMPTY: Draw = { count: 0, area: 0, perim: 0 };

function encodeQuote(address: Address | null, lines: QuoteLine[], planId: string) {
  const payload = {
    a: address,
    p: planId,
    i: lines.map((l) => ({
      s: l.service,
      c: l.coords,
      pi: l.pitchId ?? null,
      st: l.storeys ?? null,
      m: l.material ?? null,
      h: l.inhibitor ? 1 : 0,
    })),
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decodeQuote(token: string) {
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
}

export default function QuoteMeasure({
  defaultService = "driveway",
  heading = "Measure it yourself. Get the price now.",
  intro = "Find your place on the satellite map, tap the corners of what needs cleaning, and the price appears as you draw.",
  asPageTitle = false,
}: {
  defaultService?: string;
  heading?: string;
  intro?: string;
  /* On /instant-quote the tool IS the page, so its heading is the H1.
     Everywhere else it sits under a service page's own H1. */
  asPageTitle?: boolean;
}) {
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [addrText, setAddrText] = useState("");
  const [results, setResults] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [searching, setSearching] = useState(false);

  const [serviceId, setServiceId] = useState(defaultService);
  const [pitchId, setPitchId] = useState("normal");
  const [storeys, setStoreys] = useState(1);
  const [material, setMaterial] = useState<string>("metal");
  const [inhibitor, setInhibitor] = useState(false);
  const [planId, setPlanId] = useState("once");

  const [mode, setMode] = useState<"trace" | "box">("trace");
  const [draw, setDraw] = useState<Draw>(EMPTY);
  const [hint, setHint] = useState("Enter your address to begin.");
  const [hintOpen, setHintOpen] = useState(true);

  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [nudgeOff, setNudgeOff] = useState(false);
  const [peek, setPeek] = useState(false);
  const [peekTouched, setPeekTouched] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [restored, setRestored] = useState(false);

  const service = getQuoteService(serviceId) ?? QUOTE_SERVICES[0];
  /* Suburb travel loading comes from the address (lib/pricing.ts). The
     server works it out again from the same label when the quote is booked. */
  const suburbZone = useMemo(() => (address?.label ? zoneFromAddress(address.label) : null), [address]);
  const totals = useMemo(() => quoteTotals(lines, planId, suburbZone), [lines, planId, suburbZone]);

  /* Live figure for the shape currently being drawn. */
  const live = useMemo(() => {
    if (draw.count < 3) return { billable: 0, cash: 0 };
    const billable = Math.round(
      billableFor({ mode: service.mode, area: draw.area, perim: draw.perim, pitchId, storeys })
    );
    if (service.mode === "panels") {
      const panels = Math.max(1, Math.round(draw.area / QUOTE_CONFIG.solarPanelM2));
      return { billable: panels, cash: Math.max(panels * QUOTE_CONFIG.solarRatePerPanel, service.min) };
    }
    return { billable, cash: shapePrice(service, billable, { material, inhibitor, storeys }).amount };
  }, [draw, service, pitchId, storeys, material, inhibitor]);

  /* ------------------------------------------------------------ map refs */
  const mapEl = useRef<HTMLDivElement | null>(null);
  const G = useRef<any>(null); // the Leaflet module
  const map = useRef<any>(null);
  const points = useRef<LatLng[]>([]);
  const vertexM = useRef<any[]>([]);
  const edgeM = useRef<any[]>([]);
  const poly = useRef<any>(null);
  const ghost = useRef<any>(null);
  const committed = useRef<any[]>([]);
  const homePin = useRef<any>(null);
  const boxA = useRef<any>(null);
  const modeRef = useRef<"trace" | "box">("trace");
  const hasAddr = useRef(false);
  const refresh = useRef<() => void>(() => {});

  const clearShape = useCallback(() => {
    points.current = [];
    boxA.current = null;
    refresh.current();
  }, []);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    hasAddr.current = Boolean(address && address.lat != null);
  }, [address]);

  /* ---------------------------------------------------------- map setup */
  useEffect(() => {
    let dead = false;
    let created: any = null;

    import("leaflet")
      .then((mod) => {
        const L: any = (mod as any).default ?? mod;
        if (dead || !mapEl.current) return;
        G.current = L;

        const m = L.map(mapEl.current, {
          center: [QUOTE_CONFIG.start.lat, QUOTE_CONFIG.start.lng],
          zoom: QUOTE_CONFIG.start.zoom,
          minZoom: 5,
          maxZoom: 22,
          zoomControl: false,
          attributionControl: true,
          keyboard: false,
          doubleClickZoom: false, // a quick second tap is a second corner, not a zoom
          tapTolerance: 12,
        });
        created = m;
        map.current = m;
        m.attributionControl.setPrefix(false);
        L.control.zoom({ position: "bottomright" }).addTo(m);
        L.tileLayer(IMAGERY_URL, {
          minZoom: 5,
          maxNativeZoom: 20,
          maxZoom: 22,
          keepBuffer: 3, // hold a ring of tiles around the view so small pans don't show gaps
          attribution: IMAGERY_CREDIT,
        })
          .on("tileerror", () => {
            /* One missing tile is normal at the edge of coverage; the whole
               layer failing means the government server is down. */
          })
          .addTo(m);

        const pushDraw = () => {
          const pts = points.current;
          setDraw({ count: pts.length, area: polygonArea(pts), perim: perimeter(pts) });
        };

        const toLL = (p: LatLng) => [p.lat, p.lng];

        const redraw = () => {
          vertexM.current.forEach((x) => x.remove());
          vertexM.current = [];
          edgeM.current.forEach((x) => x.remove());
          edgeM.current = [];
          if (poly.current) poly.current.remove();
          if (ghost.current) ghost.current.remove();
          poly.current = ghost.current = null;

          const pts = points.current;

          if (pts.length >= 3) {
            poly.current = L.polygon(pts.map(toLL), {
              color: "#FFC53D",
              weight: 2.5,
              fillColor: "#FFC53D",
              fillOpacity: 0.22,
              interactive: false,
            }).addTo(m);
          } else if (pts.length === 2) {
            ghost.current = L.polyline(pts.map(toLL), {
              color: "#FFC53D",
              weight: 2.5,
              opacity: 0.9,
              interactive: false,
            }).addTo(m);
          }

          pts.forEach((p, i) => {
            const mk = L.marker(toLL(p), {
              icon: dotIcon(L, "cbc-vtx"),
              draggable: true,
              autoPan: true,
              zIndexOffset: 1000,
              keyboard: false,
            }).addTo(m);
            mk.on("drag", (ev: any) => {
              const ll = ev.target.getLatLng();
              points.current[i] = { lat: ll.lat, lng: ll.lng };
              /* Move the outline live but leave markers alone mid-drag —
                 rebuilding them drops the drag. */
              if (poly.current) poly.current.setLatLngs(points.current.map(toLL));
              if (ghost.current) ghost.current.setLatLngs(points.current.map(toLL));
              pushDraw();
            });
            mk.on("dragend", () => redraw());
            vertexM.current.push(mk);
          });

          /* Edge labels do double duty: real length of every side, and
             tapping one drops a corner in the middle of that side. */
          if (pts.length >= 2) {
            const lens = edgeLengths(pts);
            const n = pts.length;
            const segs = n < 3 ? n - 1 : n;
            for (let i = 0; i < segs; i++) {
              const a = pts[i];
              const b = pts[(i + 1) % n];
              const mid = { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
              const label = L.marker(toLL(mid), {
                icon: dotIcon(L, "cbc-edge", lens[i].toFixed(1) + " m"),
                zIndexOffset: 500,
                keyboard: false,
                title: "Tap to add a corner here",
              }).addTo(m);
              label.on("click", (ev: any) => {
                L.DomEvent.stopPropagation(ev);
                points.current.splice(i + 1, 0, mid);
                redraw();
              });
              edgeM.current.push(label);
            }
          }

          pushDraw();
        };

        refresh.current = redraw;

        m.on("click", (e: any) => {
          if (!hasAddr.current) {
            setHint("Pop your address in first so we land on the right roof.");
            setHintOpen(true);
            return;
          }
          const raw = { lat: e.latlng.lat, lng: e.latlng.lng };

          if (modeRef.current === "box") {
            if (!boxA.current) {
              boxA.current = raw;
              setHint("Now tap the <b>opposite corner</b>.");
              return;
            }
            const a = boxA.current;
            points.current = [
              { lat: a.lat, lng: a.lng },
              { lat: a.lat, lng: raw.lng },
              { lat: raw.lat, lng: raw.lng },
              { lat: raw.lat, lng: a.lng },
            ];
            boxA.current = null;
            modeRef.current = "trace";
            setMode("trace");
            redraw();
            setHint("Box drawn. Drag any corner to match the real shape.");
            return;
          }

          let pt: LatLng = raw;
          const pts = points.current;
          if (pts.length >= 2) pt = snapRightAngle(pts[pts.length - 2], pts[pts.length - 1], pt);
          points.current = [...pts, pt];
          redraw();
        });

        setReady(true);
      })
      .catch(() => setFailed("load"));

    return () => {
      dead = true;
      if (created) created.remove();
      map.current = null;
    };
  }, []);

  /* --------------------------------------------------- reopen from link */
  useEffect(() => {
    if (!ready) return;
    const hash = window.location.hash;
    if (!hash.startsWith("#quote=")) return;
    try {
      const st = decodeQuote(hash.slice(7));
      const rebuilt: QuoteLine[] = [];
      const L = G.current;
      const bounds = L.latLngBounds([]);

      (st.i ?? []).forEach((raw: any) => {
        const priced = priceShape({
          service: raw.s,
          pitchId: raw.pi,
          storeys: raw.st,
          material: raw.m ?? null,
          inhibitor: Boolean(raw.h),
          coords: raw.c,
        });
        if (!priced) return;
        rebuilt.push(priced);
        const pts = raw.c.map(([lat, lng]: [number, number]) => ({ lat, lng }));
        committed.current.push(
          L.polygon(
            pts.map((p: LatLng) => [p.lat, p.lng]),
            { color: "#5AD1A5", weight: 2, fillColor: "#5AD1A5", fillOpacity: 0.16, interactive: false }
          ).addTo(map.current)
        );
        pts.forEach((p: LatLng) => bounds.extend([p.lat, p.lng]));
      });

      if (st.a) {
        setAddress(st.a);
        setAddrText(st.a.label ?? "");
        hasAddr.current = st.a.lat != null;
      }
      if (st.p) setPlanId(st.p);
      if (bounds.isValid()) map.current.fitBounds(bounds, { padding: [80, 80] });
      if (rebuilt.length) {
        setLines(rebuilt);
        setNudgeOff(true);
        setRestored(true);
      }
    } catch {
      /* A mangled link isn't worth an error — just start fresh. */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  /* ------------------------------------------------------------ address */
  /* Our own Cairns address list first (instant, knows house numbers). */
  const searchLocal = useCallback(async (q: string) => {
    const res = await fetch("/api/address?q=" + encodeURIComponent(q));
    const data = await res.json();
    return (data.results ?? []) as { label: string; lat: number; lng: number }[];
  }, []);

  /* Suggestions as you type. Waits for a short pause so it isn't a request
     per keystroke, and ignores answers to anything but the latest text. */
  const typed = useRef(0);
  useEffect(() => {
    const q = addrText.trim();
    if (q.length < 3 || (address && address.label === addrText)) return;
    const ticket = ++typed.current;
    const t = window.setTimeout(async () => {
      try {
        const hits = await searchLocal(q);
        if (ticket === typed.current) setResults(hits);
      } catch {
        /* Quiet while typing — FIND reports problems. */
      }
    }, 180);
    return () => window.clearTimeout(t);
  }, [addrText, address, searchLocal]);

  const findAddress = useCallback(async () => {
    const q = addrText.trim();
    if (!q) return;
    setSearching(true);
    try {
      const local = await searchLocal(q);
      if (local.length) {
        setResults(local);
        setHintOpen(false);
        return;
      }
      /* Outside our Cairns list: one OpenStreetMap lookup, only on FIND
         (their usage rules don't allow search-as-you-type). */
      const res = await fetch(
        "https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=au&limit=6&q=" +
          encodeURIComponent(q),
        { headers: { Accept: "application/json" } }
      );
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) {
        setResults([]);
        setHint("No match — check the street name, or drag the map to your place.");
        setHintOpen(true);
        return;
      }
      setResults(data.map((r: any) => ({ label: r.display_name, lat: +r.lat, lng: +r.lon })));
      setHintOpen(false);
    } catch {
      setHint("Address lookup is offline — drag the map to your place and start tapping corners.");
      setHintOpen(true);
      setAddress({ label: "(marked on map)", lat: null, lng: null });
      hasAddr.current = true;
    } finally {
      setSearching(false);
    }
  }, [addrText, searchLocal]);

  const pickAddress = useCallback(
    (a: Address, instant?: boolean) => {
      setAddress(a);
      setAddrText(a.label);
      setResults([]);
      setHint(service.hint);
      setHintOpen(true);
      if (a.lat == null || a.lng == null || !map.current) return;

      const L = G.current;
      if (homePin.current) homePin.current.remove();
      homePin.current = L.marker([a.lat, a.lng], {
        icon: dotIcon(L, "cbc-home"),
        interactive: false,
        keyboard: false,
      }).addTo(map.current);

      if (reduced || instant) {
        map.current.setView([a.lat, a.lng], QUOTE_CONFIG.workZoom, { animate: false });
      } else {
        /* Drop from street level onto the roof. Proof we found the right
           house, not decoration. Starting any higher makes the map fetch
           imagery at every zoom on the way down, which is slow on a phone. */
        map.current.setView([a.lat, a.lng], 17, { animate: false });
        map.current.flyTo([a.lat, a.lng], QUOTE_CONFIG.workZoom, { duration: 0.9 });
      }
    },
    [service.hint, reduced]
  );

  const zoneInfo = useMemo(() => {
    if (!address || address.lat == null || address.lng == null) return null;
    const km = distanceKm(QUOTE_CONFIG.serviceArea, { lat: address.lat, lng: address.lng });
    return { km: Math.round(km), inside: km <= QUOTE_CONFIG.serviceArea.radiusKm };
  }, [address]);

  /* The service-area chip is a one-time reassurance, not a permanent panel.
     It says its piece and clears out — on a phone every pixel it holds is a
     pixel of roof you can't tap. */
  const [zoneShown, setZoneShown] = useState(true);
  useEffect(() => {
    if (!zoneInfo) return;
    setZoneShown(true);
    const t = window.setTimeout(() => setZoneShown(false), 7000);
    return () => window.clearTimeout(t);
  }, [zoneInfo]);
  const zone = zoneShown ? zoneInfo : null;

  /* ------------------------------------------------------------ actions */
  const addArea = useCallback(() => {
    if (points.current.length < 3) return;
    const priced = priceShape({
      service: service.id,
      pitchId: service.mode === "roof" ? pitchId : null,
      storeys: service.mode === "walls" || service.mode === "gutter" ? storeys : null,
      material: service.mode === "roof" ? (material as "metal" | "tile" | "unsure") : null,
      inhibitor: Boolean(service.inhibitor && inhibitor),
      coords: points.current.map((p) => [+p.lat.toFixed(6), +p.lng.toFixed(6)] as [number, number]),
    });
    if (!priced) return;

    committed.current.push(
      G.current
        .polygon(
          points.current.map((p) => [p.lat, p.lng]),
          { color: "#5AD1A5", weight: 2, fillColor: "#5AD1A5", fillOpacity: 0.16, interactive: false }
        )
        .addTo(map.current)
    );
    setLines((prev) => [...prev, priced]);
    clearShape();
    setShareUrl("");
  }, [service, pitchId, storeys, material, inhibitor, clearShape]);

  const removeLine = useCallback((i: number) => {
    const layer = committed.current[i];
    if (layer) layer.remove();
    committed.current.splice(i, 1);
    setLines((prev) => prev.filter((_, n) => n !== i));
    setShareUrl("");
  }, []);

  const undo = useCallback(() => {
    if (boxA.current) {
      boxA.current = null;
      return;
    }
    points.current = points.current.slice(0, -1);
    refresh.current();
  }, []);

  /* ------------------------------------------------------------- photos */
  const onPhotos = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS);
    const out: string[] = [];
    for (const file of files) {
      const raw = await new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.readAsDataURL(file);
      });
      /* Resized before it leaves the phone — a 6MB camera photo would blow
         the Server Action body limit and cost the customer their data. */
      const small = await new Promise<string>((res) => {
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, 1200 / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * k);
          c.height = Math.round(img.height * k);
          c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
          res(c.toDataURL("image/jpeg", 0.75));
        };
        img.onerror = () => res(raw);
        img.src = raw;
      });
      out.push(small);
    }
    setPhotos(out);
  }, []);

  /* ------------------------------------------------------------- submit */
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [result, formAction, pending] = useActionState<BookMeasuredQuoteResult | null, FormData>(
    bookMeasuredQuote,
    null
  );

  /* An accepted quote or a site-visit request is a lead. The value is the
     quoted total, except for site visits, which have no agreed price yet. */
  useLeadEvent(result, "instant-quote", totals.needsSiteVisit ? undefined : totals.grand);

  useEffect(() => {
    dialogRef.current?.setAttribute("closedby", "any");
  }, [ready]);

  const payload = useMemo(
    () =>
      JSON.stringify({
        address,
        planId,
        shapes: lines.map((l) => ({
          service: l.service,
          pitchId: l.pitchId ?? null,
          storeys: l.storeys ?? null,
          material: l.material ?? null,
          inhibitor: Boolean(l.inhibitor),
          coords: l.coords,
        })),
        photos,
        siteVisit: totals.needsSiteVisit,
        resumeLink:
          typeof window === "undefined"
            ? ""
            : `${window.location.origin}${window.location.pathname}#quote=${encodeQuote(address, lines, planId)}`,
      }),
    [address, planId, lines, photos, totals.needsSiteVisit]
  );

  const showNudge = lines.length > 0 && !lines.some((l) => l.service === "roof") && !nudgeOff;

  useEffect(() => {
    if (lines.length && !peekTouched && window.matchMedia("(max-width:900px)").matches) setPeek(true);
  }, [lines.length, peekTouched]);

  /* The prompt always says which of three steps you're on, in plain words.
     Recomputed from state, so it can never get stuck on a stale message. */
  useEffect(() => {
    if (!address) {
      setHint("<b>Step 1</b> — type your address in the box above");
    } else if (mode === "box" && draw.count === 0) {
      setHint("Tap one <b>corner</b> of the area, then the opposite one");
    } else if (draw.count === 0) {
      setHint(`<b>Step 2</b> — tap each corner of the ${service.name.toLowerCase()}`);
    } else if (draw.count < 3) {
      setHint("Keep tapping the corners — it joins up by itself");
    } else {
      setHint("<b>Step 3</b> — drag a corner to adjust, then add it to your quote");
    }
    setHintOpen(true);
  }, [address, draw.count, mode, service.name]);

  /* ---------------------------------------------------------------- view */
  return (
    <section className={styles.wrap} id="instant-quote">
      <div className={styles.intro}>
        {asPageTitle ? (
          <>
            <h1>
              <span className={styles.eyebrow}>INSTANT PRESSURE CLEANING QUOTE · CAIRNS</span>{" "}
              {heading}
            </h1>
          </>
        ) : (
          <>
            <span className={styles.eyebrow}>INSTANT SATELLITE QUOTE</span>
            <h2>{heading}</h2>
          </>
        )}
        <p>{intro}</p>
      </div>

      <div className={styles.stage}>
        <div ref={mapEl} className={styles.map} />

        {failed && (
          <div className={styles.fallback}>
            <div>
              <b>The map didn&apos;t load</b>
              <p>Give us a call on 0434 052 755 and we&apos;ll quote it the old way — it takes two minutes.</p>
            </div>
          </div>
        )}

        <div className={styles.scrim} />

        <div className={`${styles.search} ${styles.glass}`}>
          <span className={styles.pinIcon} aria-hidden="true">
            ◎
          </span>
          <input
            type="text"
            value={addrText}
            onChange={(e) => {
              setAddrText(e.target.value);
              if (e.target.value.trim().length < 3) setResults([]);
            }}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                /* Enter takes the top suggestion, like every map app. */
                if (results.length) pickAddress(results[0]);
                else findAddress();
              }
            }}
            placeholder="Start typing your address…"
            aria-label="Your address"
            id="cbc-quote-address"
          />
          <button type="button" className={styles.go} onClick={findAddress} disabled={searching}>
            {searching ? "…" : "FIND"}
          </button>
        </div>

        {results.length > 0 && (
          <div className={`${styles.results} ${styles.glass}`}>
            {results.map((r) => (
              <button key={r.label} type="button" onClick={() => pickAddress(r)}>
                {r.label}
              </button>
            ))}
          </div>
        )}

        {/* Two things a person needs while drawing, in words. Everything else
            lives behind "More" — a row of unlabelled icons reads as a CAD
            program to someone who just wants their driveway cleaned.

            Hidden while address results are showing: on a phone the rail is
            full width and sits exactly where the results list drops, so it
            swallowed the tap that picks your address. Nothing on it is usable
            at that moment anyway — nothing has been drawn yet. */}
        {results.length === 0 && (
        <div className={`${styles.rail} ${styles.glass}`}>
          <button type="button" onClick={undo} disabled={draw.count === 0}>
            Undo
          </button>
          <button type="button" onClick={clearShape} disabled={draw.count === 0}>
            Start again
          </button>
          <button type="button" aria-expanded={toolsOpen} onClick={() => setToolsOpen((o) => !o)}>
            More {toolsOpen ? "▲" : "▼"}
          </button>
        </div>
        )}

        {toolsOpen && (
          <div className={`${styles.tools} ${styles.glass}`}>
            <button
              type="button"
              aria-pressed={mode === "trace"}
              onClick={() => {
                setMode("trace");
                setToolsOpen(false);
              }}
            >
              Tap each corner
            </button>
            <button
              type="button"
              aria-pressed={mode === "box"}
              onClick={() => {
                clearShape();
                setMode("box");
                setToolsOpen(false);
              }}
            >
              Draw a box instead
            </button>
          </div>
        )}

        {/* One column, so these can never land on top of each other. Earlier
            the prompt, the service-area chip and the readout were each
            positioned independently and collided on a phone. */}
        <div className={styles.hud}>
          {hintOpen && (
            <div className={`${styles.hint} ${styles.glass}`} dangerouslySetInnerHTML={{ __html: hint }} />
          )}

          {zone && (
            <div className={`${styles.zone} ${styles.glass} ${zone.inside ? styles.zoneIn : styles.zoneOut}`}>
              <i className={styles.dot} />
              {zone.inside ? (
                <>
                  <b>You&apos;re in our run.</b>
                  <span>{zone.km} km from base</span>
                </>
              ) : (
                <>
                  <b>Outside our regular run.</b>
                  <span>{zone.km} km out — still quote it</span>
                </>
              )}
            </div>
          )}

          <div className={`${styles.readout} ${styles.glass}`} aria-live="polite">
            <div className={styles.val}>
              <span>{live.billable.toLocaleString("en-AU")}</span>
              <u>{service.mode === "panels" ? "panels" : service.mode === "gutter" ? "m of gutter" : "m²"}</u>
            </div>
            <div className={styles.sub}>
              {draw.count < 3
                ? draw.count === 0
                  ? "Tap each corner of the area"
                  : `${draw.count} corner${draw.count > 1 ? "s" : ""} so far`
                : service.mode === "walls" || service.mode === "gutter"
                  ? `${Math.round(draw.perim)} m around · ${storeys} storey${storeys > 1 ? "s" : ""}`
                  : service.mode === "roof"
                    ? `${Math.round(draw.area)} m² footprint · slope added`
                    : `${Math.round(draw.perim)} m perimeter · ${draw.count} corners`}
            </div>
            {live.billable > 0 && service.mode !== "panels" && service.mode !== "gutter" && (
              <div className={styles.scale}>{scaleComparison(live.billable)}</div>
            )}
            {live.cash > 0 && (
              <div className={styles.cash}>
                {money(live.cash)} · {service.name.toLowerCase()}
              </div>
            )}
          </div>

          {/* The single most important control on the screen. It was a 38px
              tick in a row of icons; on a phone, in a driveway, that is not
              a button anyone finds. */}
          {draw.count >= 3 && (
            <button type="button" className={styles.addBtn} onClick={addArea}>
              Add this area to my quote
            </button>
          )}

          {service.mode === "roof" && (
            <div className={`${styles.mods} ${styles.glass}`}>
              <span className={styles.label}>Pitch</span>
              {QUOTE_CONFIG.pitches.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={p.id === pitchId}
                  title={`${p.desc} — ${p.deg}°, ${Math.round((1 / Math.cos((p.deg * Math.PI) / 180) - 1) * 100)}% more surface than the footprint`}
                  onClick={() => setPitchId(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {service.mode === "roof" && (
            <div className={`${styles.mods} ${styles.glass}`}>
              <span className={styles.label}>Roof</span>
              {ROOF_MATERIALS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={m.id === material}
                  title={`${m.desc}${m.id === "unsure" ? "" : ` · $${m.rate.toFixed(2)}/m², from $${m.min}`}`}
                  onClick={() => setMaterial(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {service.inhibitor && (
            <div className={`${styles.mods} ${styles.glass}`}>
              <span className={styles.label}>Mould inhibitor</span>
              <button type="button" aria-pressed={!inhibitor} onClick={() => setInhibitor(false)}>
                No
              </button>
              <button
                type="button"
                aria-pressed={inhibitor}
                title={`Slows the black mould coming back. +$${QUOTE_CONFIG.inhibitorPerM2.toFixed(2)}/m²`}
                onClick={() => setInhibitor(true)}
              >
                Yes +${QUOTE_CONFIG.inhibitorPerM2.toFixed(2)}/m²
              </button>
            </div>
          )}

          {(service.mode === "walls" || service.mode === "gutter") && (
            <div className={`${styles.mods} ${styles.glass}`}>
              <span className={styles.label}>Storeys</span>
              {[1, 2, 3].map((n) => (
                <button key={n} type="button" aria-pressed={n === storeys} onClick={() => setStoreys(n)}>
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`${styles.services} ${styles.glass} ${lines.length ? styles.shift : ""}`}>
          {QUOTE_SERVICES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={s.id === serviceId}
              onClick={() => {
                setServiceId(s.id);
                if (points.current.length === 0) {
                  setHint(s.hint);
                  setHintOpen(true);
                }
              }}
            >
              {s.name}
            </button>
          ))}
        </div>

        {lines.length > 0 && (
          <aside className={`${styles.quote} ${styles.glass} ${peek ? styles.peek : ""}`}>
            <div
              className={styles.qhead}
              onClick={() => {
                setPeekTouched(true);
                setPeek((p) => !p);
              }}
            >
              <span className={styles.label}>Your quote</span>
              <button type="button" className={styles.qmin} aria-label="Collapse or expand the quote">
                ▼
              </button>
            </div>

            <div className={styles.qbody}>
              {restored && (
                <p className={styles.restored}>
                  <b>Quote reopened.</b> Change anything, or accept it as is.
                </p>
              )}
              {lines.map((l, i) => (
                <div className={styles.qline} key={`${l.service}-${i}`}>
                  <div className={styles.nm}>
                    {l.label}
                    <small>{explainLine(l)}</small>
                  </div>
                  <div className={styles.amt}>{money(l.amount)}</div>
                  <button
                    type="button"
                    className={styles.kill}
                    aria-label={`Remove ${l.label}`}
                    onClick={() => removeLine(i)}
                  >
                    ×
                  </button>
                </div>
              ))}

              {showNudge && (
                <div className={styles.nudge}>
                  <b>While we&apos;re on site — the roof too?</b>
                  Same visit, same gear, one trip out to you.
                  <div className={styles.nudgeActs}>
                    <button
                      type="button"
                      className={styles.yes}
                      onClick={() => {
                        setServiceId("roof");
                        setNudgeOff(true);
                        clearShape();
                        setPeek(false);
                      }}
                    >
                      Measure it
                    </button>
                    <button type="button" className={styles.no} onClick={() => setNudgeOff(true)}>
                      No thanks
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.plans}>
              {QUOTE_CONFIG.plans.map((p) => (
                <button key={p.id} type="button" aria-pressed={p.id === planId} onClick={() => setPlanId(p.id)}>
                  <b>{p.label}</b>
                  <small>{p.blurb}</small>
                </button>
              ))}
            </div>

            <div className={styles.sums}>
              <div className={styles.r}>
                <span>Cleaning</span>
                <span>{money(totals.work)}</span>
              </div>
              {totals.saving > 0 && (
                <div className={`${styles.r} ${styles.save}`}>
                  <span>{totals.plan.label} saving</span>
                  <span>−{money(totals.saving)}</span>
                </div>
              )}
              <div className={styles.r}>
                <span>
                  {totals.zone && totals.loading != null
                    ? `${totals.zone} ${pct(totals.loading)}`
                    : "Suburb loading"}
                </span>
                <span>{totals.travel != null ? money(totals.travel) : "set by your address"}</span>
              </div>
            </div>

            <div className={styles.total}>
              <span className={styles.label}>{totals.needsSiteVisit ? "Indicative" : "Total"}</span>
              <b>{money(totals.grand)}</b>
            </div>
            <div className={styles.fine}>Incl. GST · ABN 36 318 413 406</div>

            {totals.needsSiteVisit && (
              <p className={styles.siteVisit}>
                <b>We&apos;ll walk this one first.</b> {totals.siteVisitReason}. The figure above is a
                genuine indication from the measurement — we confirm it on site before anyone commits.
              </p>
            )}

            <div className={styles.qfoot}>
              <button type="button" className={styles.cta} onClick={() => dialogRef.current?.showModal()}>
                {totals.needsSiteVisit ? "Request a site visit" : `Accept ${money(totals.grand)} & book`}
              </button>
              <div className={styles.mini}>
                <button
                  type="button"
                  onClick={() => {
                    setShareUrl(
                      `${window.location.origin}${window.location.pathname}#quote=${encodeQuote(address, lines, planId)}`
                    );
                    setCopied(false);
                  }}
                >
                  🔗 Share this quote
                </button>
              </div>
              {shareUrl && (
                <div className={styles.shareField}>
                  <input type="text" readOnly value={shareUrl} aria-label="Shareable quote link" />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                        setCopied(true);
                      } catch {
                        setCopied(false);
                      }
                    }}
                  >
                    {copied ? "COPIED" : "COPY"}
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      <p className={styles.note}>
        Tap an edge label to drop a corner in the middle of that side. Corners near square snap to 90°.
        Satellite imagery is indicative — the price is confirmed on site, before we start, not after.
      </p>

      {/* ------------------------------------------------------- booking */}
      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="cbc-quote-dialog-title">
        {result?.ok ? (
          <div className={`${styles.sheet} ${styles.glass} ${styles.done}`}>
            <div className={styles.tick}>✓</div>
            <h3>That&apos;s in.</h3>
            <p>{result.message}</p>
            <button type="button" className={styles.ghost} onClick={() => dialogRef.current?.close()}>
              Close
            </button>
          </div>
        ) : (
          <form action={formAction} className={`${styles.sheet} ${styles.glass}`}>
            {/* Honeypot: hidden from people, filled by bots. See lib/guard.ts. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />

            <div className={styles.sh}>
              <h2 id="cbc-quote-dialog-title">
                {totals.needsSiteVisit ? "Book the site visit" : "Lock it in"}
              </h2>
              <button type="button" className={styles.x} onClick={() => dialogRef.current?.close()}>
                ×
              </button>
            </div>

            <div className={styles.sb}>
              <div className={styles.recap}>
                <b>{money(totals.grand)}</b>
                <div>
                  {lines.map((l) => `${l.label.toLowerCase()} ${l.billable} ${l.mode === "panels" ? "panels" : l.mode === "gutter" ? "m" : "m²"}`).join(" · ")}
                  {totals.saving > 0 ? ` · ${totals.plan.label}` : ""}
                  <br />
                  {address?.label ?? ""}
                </div>
              </div>

              <input type="hidden" name="quote" value={payload} />

              <div className={styles.two}>
                <div className={styles.fld}>
                  <label className={styles.label} htmlFor="q-first">First name</label>
                  <input id="q-first" name="firstName" type="text" autoComplete="given-name" required />
                </div>
                <div className={styles.fld}>
                  <label className={styles.label} htmlFor="q-last">Last name</label>
                  <input id="q-last" name="lastName" type="text" autoComplete="family-name" />
                </div>
              </div>

              <div className={styles.two}>
                <div className={styles.fld}>
                  <label className={styles.label} htmlFor="q-phone">Mobile</label>
                  <input id="q-phone" name="phone" type="tel" autoComplete="tel" required />
                </div>
                <div className={styles.fld}>
                  <label className={styles.label} htmlFor="q-email">Email</label>
                  <input id="q-email" name="email" type="email" autoComplete="email" />
                </div>
              </div>

              <div className={styles.fld}>
                <label className={styles.label} htmlFor="q-photos">Photo of the worst patch</label>
                <input id="q-photos" type="file" accept="image/*" multiple onChange={onPhotos} />
                {photos.length > 0 && (
                  <div className={styles.thumbs}>
                    {photos.map((p, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={p} alt={`Photo ${i + 1}`} />
                    ))}
                  </div>
                )}
                <p className={styles.note}>Optional. Helps us bring the right chemical the first time.</p>
              </div>

              <div className={styles.fld}>
                <label className={styles.label} htmlFor="q-notes">Anything we should know?</label>
                <textarea id="q-notes" name="notes" rows={3} placeholder="Gate code, dog, best day…" />
              </div>

              <div className={styles.rowbtn}>
                <button type="button" className={styles.ghost} onClick={() => dialogRef.current?.close()}>
                  Back
                </button>
                <button type="submit" className={styles.cta} disabled={pending}>
                  {pending ? "Sending…" : totals.needsSiteVisit ? "Request the visit" : "Send booking request"}
                </button>
              </div>

              {result && !result.ok && <p className={styles.err}>{result.message}</p>}

              <p className={styles.note}>
                You&apos;re not charged now. We confirm the day by text, then the job lands in our system.
              </p>
            </div>
          </form>
        )}
      </dialog>
    </section>
  );
}
