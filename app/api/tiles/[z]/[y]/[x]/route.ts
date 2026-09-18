/* Aerial imagery tiles for the instant quote map, passed through our own
   domain so Vercel's edge (Sydney) keeps a copy. The Queensland Government
   server takes about a second per tile; a cached tile comes back almost
   instantly for every customer after the first to look at that street.

   Imagery © State of Queensland (DNRMMRRD), CC BY 4.0 — credited on the map. */

const UPSTREAM =
  "https://spatial-img.information.qld.gov.au/arcgis/rest/services/Basemaps/LatestStateProgram_AllUsers/ImageServer/tile";

/* Roughly Innisfail to Mossman, Atherton to the coast, with room to spare.
   Anything outside is refused so this can't be used as a free imagery proxy
   for the rest of the state. */
const BOUNDS = { west: 144.9, east: 146.6, south: -17.9, north: -16.0 };

function tileToLng(x: number, z: number) {
  return (x / 2 ** z) * 360 - 180;
}
function tileToLat(y: number, z: number) {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ z: string; y: string; x: string }> }
) {
  const { z: zs, y: ys, x: xs } = await params;
  const z = Number(zs);
  const y = Number(ys);
  const x = Number(xs);
  if (![z, y, x].every(Number.isInteger) || z < 5 || z > 20 || x < 0 || y < 0) {
    return new Response("Bad tile", { status: 400 });
  }

  /* Tile edges; reject tiles that don't touch the Cairns region at all. */
  const west = tileToLng(x, z);
  const east = tileToLng(x + 1, z);
  const north = tileToLat(y, z);
  const south = tileToLat(y + 1, z);
  if (east < BOUNDS.west || west > BOUNDS.east || north < BOUNDS.south || south > BOUNDS.north) {
    return new Response("Outside service area", { status: 404, headers: { "Cache-Control": "public, max-age=86400" } });
  }

  const res = await fetch(`${UPSTREAM}/${z}/${y}/${x}`, { cache: "no-store" });
  if (!res.ok) {
    return new Response("No imagery here", {
      status: 404,
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    });
  }
  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
      /* Browser keeps it a day; the edge keeps it 30 days. The state
         reflies Cairns about once a year, so a month-old tile is current. */
      "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
    },
  });
}
