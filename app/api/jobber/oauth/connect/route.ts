import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { jobberConfig } from "../../../../../lib/jobber/config";

// Visit this route once — signed into the Cairns Bin Cleaning Jobber
// account in your browser — to authorize the site to talk to Jobber on
// its behalf. There's no UI here on purpose: this is a one-time setup
// step, not something a customer ever sees or hits.
export async function GET() {
  const state = randomBytes(16).toString("hex");

  const url = new URL(jobberConfig.authorizeUrl);
  url.searchParams.set("client_id", jobberConfig.clientId);
  url.searchParams.set("redirect_uri", jobberConfig.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", jobberConfig.scopes);
  url.searchParams.set("state", state);

  const response = NextResponse.redirect(url);
  response.cookies.set("jobber_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
