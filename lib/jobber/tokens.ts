// Durable storage for the Jobber OAuth tokens.
//
// Vercel's serverless functions have no persistent disk, so the refresh
// token — what lets us mint a new 60-minute access token without asking
// you to re-authorize — has to live somewhere outside the function
// itself. This talks to Upstash Redis over its plain REST API (one HTTP
// call, no TCP connection, no extra SDK dependency). It's the same store
// Vercel's own "Upstash for Redis" storage integration sets up for you.
//
// Set these in .env.local / your Vercel project's environment variables —
// see docs/JOBBER_SETUP.md for exactly where to get them:
//   KV_REST_API_URL / KV_REST_API_TOKEN            (Vercel's naming), or
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (Upstash's naming)
//
// This is a single-tenant integration — one Cairns Bin Cleaning Jobber
// account — so everything lives under one fixed key. No per-user logic
// needed here.

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
  /** Unix ms. See client.ts — we refresh a little before this, not at it. */
  expiresAt: number;
};

const KEY = "jobber:tokens";

function restConfig(): { url: string; token: string } {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing KV_REST_API_URL/TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN). See docs/JOBBER_SETUP.md."
    );
  }

  return { url, token };
}

export async function readTokens(): Promise<StoredTokens | null> {
  const { url, token } = restConfig();

  const res = await fetch(`${url}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Token store read failed: ${res.status}`);
  }

  const body = (await res.json()) as { result: string | null };
  return body.result ? (JSON.parse(body.result) as StoredTokens) : null;
}

export async function writeTokens(tokens: StoredTokens): Promise<void> {
  const { url, token } = restConfig();

  const res = await fetch(`${url}/set/${KEY}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(tokens),
  });

  if (!res.ok) {
    throw new Error(`Token store write failed: ${res.status}`);
  }
}
