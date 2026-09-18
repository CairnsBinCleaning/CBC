import type { NextRequest } from "next/server";

import { searchAddresses } from "../../../lib/addressSearch";

/* Search-as-you-type for the instant quote map. Cairns addresses only —
   anything outside the list falls back to OpenStreetMap in the browser. */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 120);
  const results = searchAddresses(q);
  return Response.json(
    { results },
    { headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } }
  );
}
