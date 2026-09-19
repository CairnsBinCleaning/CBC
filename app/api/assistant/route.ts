import type { NextRequest } from "next/server";

import { ASSISTANT_ENABLED, ASSISTANT_MODEL, assistantInstructions } from "../../../lib/assistant";
import { countHit } from "../../../lib/guard";

/* The website assistant (components/Assistant.tsx). One request per
   visitor message; the conversation so far comes with it, trimmed. Replies
   are logged so the questions people ask show up in the Vercel logs. */

type Msg = { role: "user" | "assistant"; content: string };

const MAX_TURNS = 12;
const MAX_CHARS = 1000;
const PER_HOUR = 30;

export async function POST(request: NextRequest) {
  if (!ASSISTANT_ENABLED()) {
    return Response.json({ error: "off" }, { status: 404 });
  }

  let body: { messages?: Msg[]; page?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  if ((await countHit("assistant", 60 * 60)) > PER_HOUR) {
    return Response.json({
      reply: "You’ve asked a lot in a short time. Give us a call on 0434 052 755 and we’ll answer directly.",
    });
  }

  const page = String(body.page ?? "").slice(0, 120);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: ASSISTANT_MODEL(),
        max_tokens: 500,
        system: assistantInstructions(page),
        messages,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("assistant: API error", res.status, (await res.text()).slice(0, 300));
      throw new Error(String(res.status));
    }
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const reply = (data.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    console.log("assistant:", { page, asked: messages[messages.length - 1].content, reply });
    return Response.json({ reply: reply || "Sorry, I didn’t catch that. Call 0434 052 755 and we’ll help." });
  } catch (error) {
    console.error("assistant failed:", error);
    return Response.json({
      reply: "I can’t answer right now. Call 0434 052 755, or use the instant quote for a price.",
    });
  }
}
