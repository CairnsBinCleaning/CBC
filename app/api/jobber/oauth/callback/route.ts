import { NextRequest, NextResponse } from "next/server";
import { connectWithCode } from "../../../../../lib/jobber/client";

// Jobber redirects here after you approve the authorization screen.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get("jobber_oauth_state")?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return new NextResponse(
      "Jobber authorization failed or expired — go back to /api/jobber/oauth/connect and try again.",
      { status: 400 }
    );
  }

  try {
    await connectWithCode(code);
  } catch (error) {
    console.error("Jobber OAuth callback failed:", error);
    return new NextResponse(
      "Connected to Jobber, but saving the tokens failed. Check the server logs and the token-store setup in docs/JOBBER_SETUP.md.",
      { status: 500 }
    );
  }

  const response = new NextResponse("Jobber is connected. You can close this tab.", {
    status: 200,
  });
  response.cookies.delete("jobber_oauth_state");
  return response;
}
