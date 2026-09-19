/* Spam and abuse guard for every public booking form.
 *
 * Each booking writes straight into Jobber from a page anyone can open, so
 * two cheap checks run before anything reaches the CRM:
 *
 *  1. Honeypot. Every form carries a hidden "website" field. People never
 *     see it; form-filling bots fill everything. Filled = bot.
 *  2. Rate limit. At most LIMIT submissions per visitor IP per WINDOW,
 *     counted in the same Upstash Redis store the Jobber tokens live in.
 *
 * Both fail open: if Redis is unreachable, a real customer still gets
 * booked. Losing a job to a flaky counter would be worse than one spam lead.
 */

import { headers } from "next/headers";

const LIMIT = 5;
const WINDOW_SECONDS = 60 * 60;

export type GuardResult = { ok: true } | { ok: false; bot: boolean; message: string };

export async function guardSubmission(formData: FormData, action: string): Promise<GuardResult> {
  if (String(formData.get("website") ?? "").trim() !== "") {
    /* Tell the bot it worked so it doesn't retry with a different shape. */
    return { ok: false, bot: true, message: "Thanks — we’ll be in touch." };
  }

  const count = await countHit(action, WINDOW_SECONDS);
  if (count > LIMIT) {
    return {
      ok: false,
      bot: false,
      message:
        "That’s a lot of requests from one place in a short time. Give us a call on 0434 052 755 and we’ll sort it directly.",
    };
  }
  return { ok: true };
}

/* One more hit for this visitor on this action, in a rolling window.
   Returns the count so far, or 0 when Redis isn't there (fail open). */
export async function countHit(action: string, windowSeconds: number): Promise<number> {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return 0;
  try {
    const h = await headers();
    const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown").split(",")[0].trim();
    const key = `ratelimit:${action}:${ip}`;

    /* INCR then EXPIRE NX in one round trip. */
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSeconds), "NX"],
      ]),
      cache: "no-store",
    });
    if (!res.ok) return 0;
    const out = (await res.json()) as { result?: unknown }[];
    return Number(out?.[0]?.result ?? 0);
  } catch {
    return 0;
  }
}
