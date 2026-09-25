/* SEO + accuracy gate for every page on the site.
 *
 * Run it against the live site or a local build:
 *   node tools/seo-check.mjs                       (live)
 *   node tools/seo-check.mjs http://localhost:3000 (a local `next start`)
 *
 * It reads the sitemap, checks every page against the rules below, and exits
 * non-zero if anything fails. Every new page has to pass the same rules, so
 * the standard doesn't drift as the site grows.
 *
 * FAIL = fix before it goes near Google. WARN = worth improving.
 */
const BASE = (process.argv[2] || "https://www.cairnsbincleaning.com.au").replace(/\/$/, "");
const LIVE = "https://www.cairnsbincleaning.com.au";

const RULES = {
  titleMin: 25, titleMax: 60,
  descMin: 110, descMax: 160,
  wordsMin: 300,
  minInternalLinks: 3,
  minInlinks: 2,
  /* Words that mean a page went out half-finished. */
  banned: ["lorem ipsum", "coming soon", "todo", "placeholder", "tbc", "xxx",
           "zacsbinandpressurecleaning", "call-out fee based", "$50 visit"],
};

const text = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
  .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const attr = (h, re) => (h.match(re) || [null, ""])[1];

async function main() {
  const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    .filter((u) => !/\.(jpg|jpeg|png|webp|avif)$/i.test(u))
    .map((u) => u.replace(LIVE, "").replace(BASE, "") || "/");

  const pages = new Map();
  const inlinks = new Map();
  const fails = [];
  const warns = [];
  const add = (list, path, msg) => list.push(`${path.padEnd(42)} ${msg}`);

  for (const path of urls) {
    const res = await fetch(BASE + path);
    const html = await res.text();
    if (res.status !== 200) { add(fails, path, `HTTP ${res.status}`); continue; }

    const title = (attr(html, /<title>([\s\S]*?)<\/title>/) || "").replace(/&amp;/g, "&").trim();
    const desc = attr(html, /<meta name="description" content="([^"]*)"/) || "";
    const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/) || "";
    const og = attr(html, /<meta property="og:image" content="([^"]*)"/) || "";
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => text(m[1]));
    const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => text(m[1]));
    const body = text(html);
    const words = body.split(/\s+/).filter((w) => /[a-z]/i.test(w)).length;
    const imgs = [...html.matchAll(/<img\b[^>]*>/g)];
    const noAlt = imgs.filter((m) => !/\balt="[^"]+"/.test(m[0]));
    const links = [...new Set([...html.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1].replace(/\/$/, "") || "/"))];
    const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    const types = [];
    for (const raw of ld) {
      try {
        const walk = (x) => {
          if (Array.isArray(x)) return x.forEach(walk);
          if (x && typeof x === "object") {
            if (x["@type"]) types.push(String(x["@type"]));
            Object.values(x).forEach(walk);
          }
        };
        walk(JSON.parse(raw));
      } catch { add(fails, path, "structured data is not valid JSON"); }
    }

    pages.set(path, { title, desc, words, types, links });
    links.forEach((l) => inlinks.set(l, (inlinks.get(l) || 0) + (l === path ? 0 : 1)));

    /* --- the rules --- */
    if (!title) add(fails, path, "no title");
    else {
      if (title.length > RULES.titleMax) add(fails, path, `title ${title.length} chars (max ${RULES.titleMax})`);
      if (title.length < RULES.titleMin) add(warns, path, `title only ${title.length} chars`);
      if (!/cairns/i.test(title)) add(warns, path, "title doesn't say Cairns");
    }
    if (!desc) add(fails, path, "no meta description");
    else {
      if (desc.length > RULES.descMax) add(fails, path, `description ${desc.length} chars (max ${RULES.descMax})`);
      if (desc.length < RULES.descMin) add(warns, path, `description only ${desc.length} chars`);
    }
    if (h1s.length !== 1) add(fails, path, `${h1s.length} H1 headings (needs exactly 1)`);
    if (h2s.length === 0) add(warns, path, "no H2 headings");
    if (canonical !== LIVE + (path === "/" ? "" : path) && canonical !== LIVE + path)
      add(fails, path, `canonical is "${canonical}"`);
    if (!og) add(warns, path, "no share image (og:image)");
    if (words < RULES.wordsMin) add(warns, path, `${words} words (thin, aim for ${RULES.wordsMin}+)`);
    if (noAlt.length) add(fails, path, `${noAlt.length} image(s) with no alt text`);
    if (links.length < RULES.minInternalLinks) add(fails, path, `only ${links.length} internal links`);
    if (!types.includes("LocalBusiness")) add(fails, path, "no LocalBusiness data for Google");
    if (path !== "/" && !types.includes("BreadcrumbList")) add(warns, path, "no breadcrumb data");
    const low = body.toLowerCase();
    for (const b of RULES.banned) if (low.includes(b)) add(fails, path, `unfinished or stale wording: "${b}"`);
    if (!/0434 052 755/.test(body)) add(fails, path, "phone number missing");
  }

  /* Orphans: a page nothing links to can't be found or ranked. */
  for (const path of pages.keys()) {
    const n = inlinks.get(path === "/" ? "/" : path.replace(/\/$/, "")) || 0;
    if (n < RULES.minInlinks) add(fails, path, `only ${n} other page(s) link to it`);
  }
  /* Duplicate titles and descriptions confuse Google about which page to show. */
  const seen = {};
  for (const [path, p] of pages) {
    (seen[p.title] = seen[p.title] || []).push(path);
  }
  for (const [t, list] of Object.entries(seen)) if (list.length > 1) add(fails, list[0], `title shared with ${list.slice(1).join(", ")}: "${t}"`);

  console.log(`Checked ${pages.size} pages on ${BASE}\n`);
  if (fails.length) { console.log(`FAIL (${fails.length})`); fails.forEach((f) => console.log("  " + f)); }
  if (warns.length) { console.log(`\nWARN (${warns.length})`); warns.forEach((w) => console.log("  " + w)); }
  if (!fails.length && !warns.length) console.log("Everything passed.");
  process.exit(fails.length ? 1 : 0);
}
main();
