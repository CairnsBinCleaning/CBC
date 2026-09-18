"use client";

/* Instant satellite quote.
 *
 * Customer finds their place on Google satellite imagery, taps the corners of
 * what needs cleaning, and gets a real price. Accepting it runs the same
 * Server Action path every other booking on this site uses.
 *
 * Deliberate choices:
 *  - Google Maps JavaScript API, hybrid view, tilt locked flat. A tilted or
 *    rotated view cannot be measured honestly.
 *  - Address lookup runs on OpenStreetMap Nominatim, not Google Places.
 *    Places and Geocoding are "Enterprise" APIs needing a full paid billing
 *    account; the map only needs the standard one. Flip USE_GOOGLE_PLACES
 *    once that account upgrades.
 *  - All geometry and pricing live in lib/quote.ts so the server recomputes
 *    the total from raw coordinates. Nothing the browser claims a job costs
 *    is ever trusted.
 *  - The map is driven imperatively through refs. React owns the panel, the
 *    map owns the shape — mixing them re-renders the tree on every drag.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  quoteTotals,
  scaleComparison,
  snapRightAngle,
  tieredPrice,
  type LatLng,
  type QuoteLine,
} from "../lib/quote";

import { bookMeasuredQuote, type BookMeasuredQuoteResult } from "../lib/jobber/actions";

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
const USE_GOOGLE_PLACES = false;
const MAX_PHOTOS = 3;

let mapsPromise: Promise<any> | null = null;

function loadMaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if ((window as any).google?.maps?.importLibrary) return Promise.resolve((window as any).google);
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      key: MAPS_KEY,
      v: "weekly",
      region: "AU",
      language: "en-AU",
      loading: "async",
      callback: "__cbcMapsReady",
    });
    (window as any).__cbcMapsReady = () => resolve((window as any).google);
    const s = document.createElement("script");
    s.src = "https://maps.googleapis.com/maps/api/js?" + params;
    s.async = true;
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(s);
  });
  return mapsPromise;
}

type Address = { label: string; lat: number | null; lng: number | null };
type Draw = { count: number; area: number; perim: number };
const EMPTY: Draw = { count: 0, area: 0, perim: 0 };

function encodeQuote(address: Address | null, lines: QuoteLine[], planId: string) {
  const payload = {
    a: address,
    p: planId,
    i: lines.map((l) => ({ s: l.service, c: l.coords, pi: l.pitchId ?? null, st: l.storeys ?? null })),
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
}: {
  defaultService?: string;
  heading?: string;
  intro?: string;
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
  const [planId, setPlanId] = useState("once");

  const [mode, setMode] = useState<"trace" | "box">("trace");
  const [labelsOn, setLabelsOn] = useState(true);
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
  const totals = useMemo(() => quoteTotals(lines, planId), [lines, planId]);

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
    return { billable, cash: Math.max(tieredPrice(billable, service.tiers), service.min) };
  }, [draw, service, pitchId, storeys]);

  /* ------------------------------------------------------------ map refs */
  const mapEl = useRef<HTMLDivElement | null>(null);
  const G = useRef<any>(null);
  const map = useRef<any>(null);
  const AdvMarker = useRef<any>(null);
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
    if (!MAPS_KEY) {
      setFailed("no-key");
      return;
    }
    let dead = false;

    loadMaps()
      .then(async (google) => {
        if (dead || !mapEl.current) return;
        G.current = google;
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        AdvMarker.current = AdvancedMarkerElement;

        const m = new Map(mapEl.current, {
          center: { lat: QUOTE_CONFIG.start.lat, lng: QUOTE_CONFIG.start.lng },
          zoom: QUOTE_CONFIG.start.zoom,
          mapTypeId: "hybrid",
          mapId: "CBC_QUOTE_MAP",
          tilt: 0,
          heading: 0,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          clickableIcons: false,      // a POI pin must never steal a corner tap
          gestureHandling: "greedy",  // one finger pans on a phone
          maxZoom: 22,
          minZoom: 5,
          keyboardShortcuts: false,
        });
        map.current = m;

        const pushDraw = () => {
          const pts = points.current;
          setDraw({ count: pts.length, area: polygonArea(pts), perim: perimeter(pts) });
        };

        const redraw = () => {
          vertexM.current.forEach((x) => (x.map = null));
          vertexM.current = [];
          edgeM.current.forEach((x) => (x.map = null));
          edgeM.current = [];
          if (poly.current) poly.current.setMap(null);
          if (ghost.current) ghost.current.setMap(null);
          poly.current = ghost.current = null;

          const pts = points.current;

          if (pts.length >= 3) {
            poly.current = new google.maps.Polygon({
              paths: pts,
              map: m,
              strokeColor: "#FFC53D",
              strokeWeight: 2.5,
              fillColor: "#FFC53D",
              fillOpacity: 0.22,
              clickable: false,
              zIndex: 5,
            });
          } else if (pts.length === 2) {
            ghost.current = new google.maps.Polyline({
              path: pts,
              map: m,
              strokeColor: "#FFC53D",
              strokeWeight: 2.5,
              strokeOpacity: 0.9,
              clickable: false,
            });
          }

          pts.forEach((p, i) => {
            const el = document.createElement("div");
            el.className = "cbc-vtx";
            const mk = new AdvancedMarkerElement({
              map: m,
              position: p,
              content: el,
              gmpDraggable: true,
              zIndex: 20,
            });
            mk.addListener("drag", (ev: any) => {
              points.current[i] = { lat: ev.latLng.lat(), lng: ev.latLng.lng() };
              /* Move the outline live but leave markers alone mid-drag —
                 rebuilding them drops the drag. */
              if (poly.current) poly.current.setPath(points.current);
              if (ghost.current) ghost.current.setPath(points.current);
              pushDraw();
            });
            mk.addListener("dragend", () => redraw());
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
              const el = document.createElement("div");
              el.className = "cbc-edge";
              el.textContent = lens[i].toFixed(1) + " m";
              el.title = "Tap to add a corner here";
              el.addEventListener("click", (ev) => {
                ev.stopPropagation();
                points.current.splice(i + 1, 0, mid);
                redraw();
              });
              edgeM.current.push(
                new AdvancedMarkerElement({ map: m, position: mid, content: el, zIndex: 15 })
              );
            }
          }

          pushDraw();
        };

        refresh.current = redraw;

        m.addListener("click", (e: any) => {
          if (!hasAddr.current) {
            setHint("Pop your address in first so we land on the right roof.");
            setHintOpen(true);
            return;
          }
          const raw = { lat: e.latLng.lat(), lng: e.latLng.lng() };

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
      const bounds = new G.current.maps.LatLngBounds();

      (st.i ?? []).forEach((raw: any) => {
        const priced = priceShape({ service: raw.s, pitchId: raw.pi, storeys: raw.st, coords: raw.c });
        if (!priced) return;
        rebuilt.push(priced);
        const pts = raw.c.map(([lat, lng]: [number, number]) => ({ lat, lng }));
        committed.current.push(
          new G.current.maps.Polygon({
            paths: pts,
            map: map.current,
            strokeColor: "#5AD1A5",
            strokeWeight: 2,
            fillColor: "#5AD1A5",
            fillOpacity: 0.16,
            clickable: false,
            zIndex: 3,
          })
        );
        pts.forEach((p: LatLng) => bounds.extend(p));
      });

      if (st.a) {
        setAddress(st.a);
        setAddrText(st.a.label ?? "");
        hasAddr.current = st.a.lat != null;
      }
      if (st.p) setPlanId(st.p);
      if (!bounds.isEmpty()) map.current.fitBounds(bounds, 80);
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
  const findAddress = useCallback(async () => {
    const q = addrText.trim();
    if (!q) return;
    setSearching(true);
    setResults([]);
    try {
      const res = await fetch(
        "https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=au&limit=6&q=" +
          encodeURIComponent(q),
        { headers: { Accept: "application/json" } }
      );
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) {
        setHint("No match — try adding the suburb, or drag the map to your place.");
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
  }, [addrText]);

  const pickAddress = useCallback(
    (a: Address, instant?: boolean) => {
      setAddress(a);
      setAddrText(a.label);
      setResults([]);
      setHint(service.hint);
      setHintOpen(true);
      if (a.lat == null || a.lng == null || !map.current) return;

      if (homePin.current) homePin.current.map = null;
      const el = document.createElement("div");
      el.className = "cbc-home";
      homePin.current = new AdvMarker.current({
        map: map.current,
        position: { lat: a.lat, lng: a.lng },
        content: el,
        zIndex: 2,
      });

      if (reduced || instant) {
        map.current.setCenter({ lat: a.lat, lng: a.lng });
        map.current.setZoom(QUOTE_CONFIG.workZoom);
      } else {
        /* Pull back to the coastline they recognise, then drop onto the roof.
           Proof we found the right house, not decoration. */
        map.current.setCenter({ lat: QUOTE_CONFIG.wideView.lat, lng: QUOTE_CONFIG.wideView.lng });
        map.current.setZoom(QUOTE_CONFIG.wideView.zoom);
        map.current.panTo({ lat: a.lat, lng: a.lng });
        let z = QUOTE_CONFIG.wideView.zoom;
        const dive = window.setInterval(() => {
          z += 1;
          map.current.setZoom(z);
          if (z >= QUOTE_CONFIG.workZoom) window.clearInterval(dive);
        }, 130);
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
      storeys: service.mode === "walls" ? storeys : null,
      coords: points.current.map((p) => [+p.lat.toFixed(6), +p.lng.toFixed(6)] as [number, number]),
    });
    if (!priced) return;

    committed.current.push(
      new G.current.maps.Polygon({
        paths: points.current,
        map: map.current,
        strokeColor: "#5AD1A5",
        strokeWeight: 2,
        fillColor: "#5AD1A5",
        fillOpacity: 0.16,
        clickable: false,
        zIndex: 3,
      })
    );
    setLines((prev) => [...prev, priced]);
    clearShape();
    setShareUrl("");
  }, [service, pitchId, storeys, clearShape]);

  const removeLine = useCallback((i: number) => {
    const layer = committed.current[i];
    if (layer) layer.setMap(null);
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

  const toggleLabels = useCallback(() => {
    const next = !labelsOn;
    setLabelsOn(next);
    map.current?.setMapTypeId(next ? "hybrid" : "satellite");
  }, [labelsOn]);

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
        <span className={styles.eyebrow}>INSTANT SATELLITE QUOTE</span>
        <h2>{heading}</h2>
        <p>{intro}</p>
      </div>

      <div className={styles.stage}>
        <div ref={mapEl} className={styles.map} />

        {failed && (
          <div className={styles.fallback}>
            <div>
              <b>{failed === "no-key" ? "Map not configured" : "The map didn't load"}</b>
              <p>
                {failed === "no-key"
                  ? "NEXT_PUBLIC_GOOGLE_MAPS_KEY isn't set for this deployment."
                  : "Give us a call on 0434 052 755 and we'll quote it the old way — it takes two minutes."}
              </p>
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
            onChange={(e) => setAddrText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                findAddress();
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
            <button type="button" aria-pressed={labelsOn} onClick={toggleLabels}>
              {labelsOn ? "Hide street names" : "Show street names"}
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
              <u>{service.mode === "panels" ? "panels" : "m²"}</u>
            </div>
            <div className={styles.sub}>
              {draw.count < 3
                ? draw.count === 0
                  ? "Tap each corner of the area"
                  : `${draw.count} corner${draw.count > 1 ? "s" : ""} so far`
                : service.mode === "walls"
                  ? `${Math.round(draw.perim)} m around · ${storeys} storey${storeys > 1 ? "s" : ""}`
                  : service.mode === "roof"
                    ? `${Math.round(draw.area)} m² footprint · slope added`
                    : `${Math.round(draw.perim)} m perimeter · ${draw.count} corners`}
            </div>
            {live.billable > 0 && service.mode !== "panels" && (
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

          {service.mode === "walls" && (
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
                  Same visit, same gear, no second {money(QUOTE_CONFIG.callOutFee)} visit fee.
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
                <span>Visit fee</span>
                <span>{money(totals.callout)}</span>
              </div>
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
                  {lines.map((l) => `${l.label.toLowerCase()} ${l.billable} ${l.mode === "panels" ? "panels" : "m²"}`).join(" · ")}
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
