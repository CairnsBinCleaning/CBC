import { NextRequest, NextResponse } from "next/server";
import { jobberConfig } from "../../../../../lib/jobber/config";
import { jobberGraphQL } from "../../../../../lib/jobber/client";

// Setup-only utility — not part of the booking flow, and safe to delete
// once you've used it. Jobber's public docs confirm `clientCreate` in
// detail but don't spell out the exact input fields for creating a
// Request/Quote from that client. Rather than guess field names for the
// mutation that actually books the job, this asks Jobber's own schema.
//
// After you've connected (done the /api/jobber/oauth/connect step once),
// visit:
//   /api/jobber/oauth/schema-check?type=RequestCreateInput&key=<your JOBBER_CLIENT_SECRET>
// and paste the JSON result back so the real requestCreate call can be
// wired up with confirmed field names instead of guessed ones.

const INTROSPECT_INPUT_TYPE = /* GraphQL */ `
  query IntrospectInputType($name: String!) {
    __type(name: $name) {
      name
      inputFields {
        name
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (key !== jobberConfig.clientSecret) {
    return new NextResponse("Not found", { status: 404 });
  }

  const typeName = request.nextUrl.searchParams.get("type") ?? "RequestCreateInput";

  try {
    const data = await jobberGraphQL(INTROSPECT_INPUT_TYPE, { name: typeName });
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
