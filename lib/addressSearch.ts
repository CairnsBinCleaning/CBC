/* Cairns address finder.
 *
 * Every street address from Gordonvale to Palm Cove (postcodes 4865, 4868,
 * 4869, 4870, 4878, 4879), taken from the national address file (G-NAF,
 * © Geoscape Australia, Open G-NAF licence, CC BY 4.0) and kept in
 * data/cairns-addresses.txt as "label|lat|lng" lines.
 *
 * Why our own copy instead of a search API:
 *  - Google's address search needs a paid billing account.
 *  - Mapbox only allows its results on a Mapbox map.
 *  - OpenStreetMap and the Queensland locator are missing most Cairns house
 *    numbers.
 * G-NAF is the official list every Australian address database starts from,
 * it can be used on any map, and a local copy answers in milliseconds.
 *
 * Refresh it every few months with tools/refresh-addresses.py.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

export type AddressHit = { label: string; lat: number; lng: number };

type Row = { label: string; lat: number; lng: number; words: string[]; street: string[]; flat: string; num: string };

/* What people type -> what the address file says. */
const ABBREV: Record<string, string> = {
  st: "street", str: "street", rd: "road", dr: "drive", drv: "drive", cl: "close",
  cres: "crescent", cr: "crescent", ave: "avenue", av: "avenue", ct: "court", crt: "court",
  pl: "place", esp: "esplanade", cct: "circuit", cir: "circuit", hwy: "highway",
  pde: "parade", tce: "terrace", bvd: "boulevard", blvd: "boulevard", ln: "lane",
  gr: "grove", gdns: "gardens", pkwy: "parkway", sq: "square",
  mt: "mount", nth: "north", sth: "south",
};
const STREET_TYPES = new Set([...Object.values(ABBREV), "close", "way", "boulevard", "circuit"]);
const NOISE = new Set(["unit", "u", "apt", "apartment", "flat", "shop", "villa", "qld", "queensland", "cairns"]);

let ROWS: Row[] | null = null;
/* Every word in the file (street names, street types, suburbs) with how
   often it appears. Used to correct typos: "sheriden" -> "sheridan". */
let VOCAB: { word: string; count: number }[] = [];
let VOCAB_SET = new Set<string>();

function load(): Row[] {
  if (ROWS) return ROWS;
  const file = readFileSync(path.join(process.cwd(), "data", "cairns-addresses.txt"), "utf8");
  ROWS = file.split("\n").map((line) => {
    const [label, lat, lng] = line.split("|");
    const head = label.split(" ")[0]; // "12", "3/12", "120-124"
    const [flat, num] = head.includes("/") ? head.split("/") : ["", head];
    const words = label
      .toLowerCase()
      .replace(/[,/]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    /* "Unit 4, 12 Smith Street, Edge Hill 4870" -> street part is "smith street" */
    const parts = label.toLowerCase().split(",");
    const streetPart = parts[parts.length - 2] ?? "";
    const street = streetPart.split(/\s+/).filter((w) => w && !/\d/.test(w));
    return { label, lat: +lat, lng: +lng, words, street, flat: flat.toLowerCase(), num: num.toLowerCase() };
  });
  const counts = new Map<string, number>();
  for (const row of ROWS) {
    for (const w of row.words) if (/^[a-z'-]{2,}$/.test(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  VOCAB = [...counts].map(([word, count]) => ({ word, count }));
  VOCAB_SET = new Set(counts.keys());
  return ROWS;
}

function numberMatches(row: Row, n: string, typingIt: boolean) {
  const first = row.num.split("-")[0];
  if (row.num === n || first === n) return true;
  /* "120" should find "120-124"; while still typing, "12" can grow into "120". */
  return typingIt && first.startsWith(n);
}

/* Typo distance (Damerau-Levenshtein, adjacent swaps count as one), with
   an early exit once it's clearly too far. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2: number[] = new Array(b.length + 1).fill(0);
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur: number[] = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    for (let j = 0; j <= b.length; j++) prev2[j] = prev[j];
    prev = cur;
  }
  return prev[b.length];
}

type Cand = { word: string; dist: number; prefix: boolean };

/* What a typed word could mean. Spelt right (or the start of a real word)
   -> itself. Otherwise the closest real words in the address file, so
   "sheriden", "edgehill"-style slips and fat-finger swaps still find it. */
function candidatesFor(t: string, last: boolean): Cand[] {
  if (/\d/.test(t)) return [{ word: t, dist: 0, prefix: true }];
  if (VOCAB_SET.has(t) || VOCAB.some((v) => v.word.startsWith(t))) return [{ word: t, dist: 0, prefix: true }];
  if (t.length < 3) return [];
  const max = t.length <= 4 ? 1 : 2;
  const found: (Cand & { count: number })[] = [];
  for (const v of VOCAB) {
    let d = editDistance(t, v.word, max);
    /* Still typing: compare with the start of the word. */
    if (last && v.word.length > t.length) {
      for (const len of [t.length - 1, t.length, t.length + 1]) {
        if (len < 3) continue;
        d = Math.min(d, editDistance(t, v.word.slice(0, len), max) + 0);
      }
    }
    if (d <= max) found.push({ word: v.word, dist: d, prefix: false, count: v.count });
  }
  found.sort((a, b) => a.dist - b.dist || b.count - a.count);
  return found.slice(0, 8);
}

export function searchAddresses(query: string, limit = 6): AddressHit[] {
  const exact = runSearch(query, limit, true);
  if (exact.length) return exact;
  /* The number isn't on that street (people misremember, or the house is
     newer than the list). Show the nearest numbers on the street instead of
     the same number on some other street. */
  const near = runSearch(query, limit, false);
  if (near.length) return near;
  /* Still nothing: drop the words we can't place at all (a business name,
     "near the school") and try again with what's left. */
  return runSearch(query, limit, true, true);
}

function runSearch(query: string, limit: number, useNumber: boolean, dropUnknown = false): AddressHit[] {
  const raw = query.toLowerCase().replace(/[,]/g, " ").trim();
  if (raw.length < 3) return [];
  const endsMidWord = !/\s$/.test(query);

  let tokens = raw.split(/\s+/).filter(Boolean);

  /* Pull the numbers off the front: "3/12", "u3 12", "12", "unit 3 12". */
  let flat = "";
  let num = "";
  const rest: string[] = [];
  for (const t of tokens) {
    const slash = t.match(/^u?(\d+[a-z]?)\/(\d+[a-z]?)$/);
    if (slash) {
      flat = slash[1];
      num = slash[2];
      continue;
    }
    const n = t.replace(/^u(?=\d)/, "");
    if (/^\d+[a-z]?$/.test(n) && (rest.length === 0 || (!num && dropUnknown))) {
      if (num) {
        flat = num;
        num = n;
      } else num = n;
      continue;
    }
    if (NOISE.has(t)) continue;
    rest.push(ABBREV[t] ?? t);
  }
  tokens = rest;
  if (!num && tokens.length === 0) return [];

  const wanted = parseInt(num, 10);
  if (!useNumber) {
    if (!num || tokens.length === 0) return [];
    num = "";
    flat = "";
  }
  const lastIsNum = tokens.length === 0 && endsMidWord;
  const rows = load();

  /* Each typed word -> what it could mean (itself, or its closest real
     spellings). A word nothing resembles either kills the search, or, on
     the last try, gets ignored. */
  let cands = tokens.map((t, i) => candidatesFor(t, i === tokens.length - 1 && endsMidWord));
  const unsure = cands.some((c) => c.length === 0 || !c[0].prefix);
  if (dropUnknown) {
    /* Last try: keep only the words spelt like a real Cairns address word
       and ignore the rest. Pointless if every word was already fine. */
    if (!unsure) return [];
    const keep = cands.map((c) => c.length > 0 && c[0].prefix);
    tokens = tokens.filter((_, i) => keep[i]);
    cands = cands.filter((_, i) => keep[i]);
    if (!num || tokens.length === 0) return [];
  } else if (cands.some((c) => c.length === 0)) return [];
  const hits: { row: Row; score: number }[] = [];

  for (const row of rows) {
    if (num && !numberMatches(row, num, lastIsNum)) continue;
    if (flat && row.flat !== flat) continue;

    let ok = true;
    let score = 0;
    let onStreet = tokens.length === 0;
    let typeOnStreet = false;
    let streetHits = 0;
    for (let i = 0; i < tokens.length; i++) {
      let t = tokens[i];
      let matched: Cand | undefined;
      for (const c of cands[i]) {
        if (row.words.some((w) => (c.prefix ? w.startsWith(c.word) : w === c.word))) {
          matched = c;
          break;
        }
      }
      if (!matched) {
        ok = false;
        break;
      }
      /* A corrected word scores a little lower than one typed right. */
      if (!matched.prefix) {
        t = matched.word;
        score -= 1.5 * matched.dist;
      }
      /* The street name is what people mean; the suburb just narrows it. */
      const isType = STREET_TYPES.has(t);
      if (row.street.some((w) => w === t)) {
        score += isType ? 1 : 4;
        if (!isType) onStreet = true;
        else typeOnStreet = true;
        streetHits++;
      } else if (row.street.some((w) => w.startsWith(t))) {
        score += 3;
        if (!isType) onStreet = true;
        streetHits++;
      }
      else if (row.words.includes(t)) score += 1;
    }
    /* "esplanade palm cove": only the street type and the suburb given.
       Good enough when there's nothing better. */
    if (!onStreet && typeOnStreet && tokens.length > 1) {
      onStreet = true;
      score -= 3;
    }
    /* "Mulgrave Road" should beat "Little Mulgrave Road". */
    score -= 0.5 * Math.max(0, row.street.length - streetHits);
    if (!ok || !onStreet) continue;
    if (!useNumber) {
      /* Nearest house number on that street; skip shops and kiosks. */
      const rn = parseInt(row.num, 10);
      if (Number.isNaN(rn)) continue;
      score -= Math.abs(rn - wanted) / 1000;
    }

    if (num && row.num === num) score += 3;
    if (!flat && !row.flat) score += 2; // "12 Smith St" means the house, not unit 7
    hits.push({ row, score });
    if (hits.length > 4000) break;
  }

  hits.sort((a, b) => b.score - a.score || a.row.label.localeCompare(b.row.label, "en", { numeric: true }));
  return hits.slice(0, limit).map(({ row }) => ({ label: row.label, lat: row.lat, lng: row.lng }));
}
