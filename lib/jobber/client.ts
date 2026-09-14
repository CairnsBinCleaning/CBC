// Thin wrapper around Jobber's OAuth + GraphQL API.
//
// Nothing here decides *what* to ask Jobber for — that lives in
// actions.ts. This file only knows how to get a valid access token and
// how to send a GraphQL request once it has one. Keeping that split means
// every future integration (requests, jobs, invoices, whatever comes
// next) reuses the same tested token handling instead of reinventing it.

import { jobberConfig } from "./config";
import { readTokens, writeTokens, type StoredTokens } from "./tokens";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
};

function toStoredTokens(body: TokenResponse): StoredTokens {
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    // Refresh 5 minutes early so a slow request never gets caught mid-flight
    // holding a token that expires a second before the response comes back.
    expiresAt: Date.now() + (body.expires_in - 300) * 1000,
  };
}

async function exchangeCodeForTokens(code: string): Promise<StoredTokens> {
  const res = await fetch(jobberConfig.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      client_id: jobberConfig.clientId,
      client_secret: jobberConfig.clientSecret,
      redirect_uri: jobberConfig.redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error(`Jobber token exchange failed: ${res.status} ${await res.text()}`);
  }

  return toStoredTokens((await res.json()) as TokenResponse);
}

async function refreshTokens(refreshToken: string): Promise<StoredTokens> {
  const res = await fetch(jobberConfig.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: jobberConfig.clientId,
      client_secret: jobberConfig.clientSecret,
    }),
  });

  if (!res.ok) {
    throw new Error(`Jobber token refresh failed: ${res.status} ${await res.text()}`);
  }

  return toStoredTokens((await res.json()) as TokenResponse);
}

/** Called once, from the OAuth callback route, right after Jobber redirects back with a code. */
export async function connectWithCode(code: string): Promise<void> {
  const tokens = await exchangeCodeForTokens(code);
  await writeTokens(tokens);
}

async function getValidAccessToken(): Promise<string> {
  const stored = await readTokens();

  if (!stored) {
    throw new Error(
      "Jobber isn't connected yet. Visit /api/jobber/oauth/connect (signed into the Cairns Bin Cleaning Jobber account) and authorize the app once."
    );
  }

  if (Date.now() < stored.expiresAt) {
    return stored.accessToken;
  }

  const refreshed = await refreshTokens(stored.refreshToken);
  await writeTokens(refreshed);
  return refreshed.accessToken;
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

/**
 * Runs one GraphQL query/mutation against Jobber, handling auth and token
 * refresh. Throws on transport failure or a top-level GraphQL error.
 *
 * Callers still need to check `userErrors` on mutations themselves —
 * Jobber returns those as ordinary successful data, not as GraphQL
 * errors, because a validation failure (like a bad email) isn't a
 * transport problem.
 */
export async function jobberGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const accessToken = await getValidAccessToken();

  const res = await fetch(jobberConfig.graphqlUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-JOBBER-GRAPHQL-VERSION": jobberConfig.apiVersion,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Jobber API request failed: ${res.status} ${await res.text()}`);
  }

  const body = (await res.json()) as GraphQLResponse<T>;

  if (body.errors?.length) {
    throw new Error(`Jobber GraphQL error: ${body.errors.map((e) => e.message).join("; ")}`);
  }

  if (!body.data) {
    throw new Error("Jobber API returned no data.");
  }

  return body.data;
}
