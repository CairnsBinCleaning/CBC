import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { jobberConfig } from "../../../../lib/jobber/config";

// Jobber requires a response inside 1 second and delivers at-least-once —
// the same event can arrive twice. So: verify, acknowledge fast, and make
// sure whatever this eventually does (past the console.log below) is safe
// to run twice on the same event.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-jobber-hmac-sha256");

  if (!signature || !verifySignature(rawBody, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload: { topic?: string; itemId?: string };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  // TODO: once this is registered against real events (set up in the
  // Developer Center's app settings page), branch on payload.topic —
  // e.g. QUOTE_APPROVE, JOB_UPDATE, INVOICE_UPDATE — and update whatever
  // the site should reflect back to the customer. For now this proves the
  // connection is live and signed correctly.
  console.log("Jobber webhook:", payload.topic, payload.itemId);

  return NextResponse.json({ received: true });
}

function verifySignature(rawBody: string, signature: string): boolean {
  const expected = createHmac("sha256", jobberConfig.clientSecret)
    .update(rawBody)
    .digest("base64");

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}
