"use client";

/* Website assistant: a small "Ask us" button, bottom right, on every page.
   Answers from lib/assistant.ts (the site's own prices and FAQs) through
   /api/assistant. Only rendered when ANTHROPIC_API_KEY is set (app/layout). */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "How much for a driveway?",
  "Do you come to my suburb?",
  "Roof or house wash price?",
];

/* Plain text in, links made clickable. No HTML from the model is trusted. */
function Linked({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+|0434 052 755)/g);
  return (
    <>
      {parts.map((p, i) =>
        /* Only our own pages become links. */
        p.startsWith("https://www.cairnsbincleaning.com.au") ? (
          <a key={i} href={p.replace(/[.,]$/, "")}>
            {p.replace("https://www.cairnsbincleaning.com.au", "") || "/"}
          </a>
        ) : p === "0434 052 755" ? (
          <a key={i} href="tel:+61434052755">
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(content: string) {
    const q = content.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setText("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          page: pathname,
          quote: (window as Window & { cbcQuoteContext?: unknown }).cbcQuoteContext ?? null,
        }),
      });
      const data = await res.json();
      setMsgs([...next, { role: "assistant", content: data.reply ?? "Call 0434 052 755 and we’ll help." }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "I can’t connect right now. Call 0434 052 755." }]);
    } finally {
      setBusy(false);
    }
  }

  /* The map page is all map; the button would sit on the drawing tools. */
  if (pathname === "/instant-quote") return null;

  return (
    <div className="cbc-assist" data-open={open}>
      {open && (
        <section className="cbc-assist-panel" aria-label="Ask Cairns Bin Cleaning">
          <header>
            <div>
              <b>Ask us anything</b>
              <small>Instant answers from our real prices. Or call 0434 052 755.</small>
            </div>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
              ×
            </button>
          </header>
          <div className="cbc-assist-list" ref={listRef} aria-live="polite">
            {msgs.length === 0 && (
              <div className="cbc-assist-starters">
                {STARTERS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => (
              <p key={i} className={m.role === "user" ? "me" : "them"}>
                <Linked text={m.content} />
              </p>
            ))}
            {busy && <p className="them typing">…</p>}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              placeholder="Type your question"
              aria-label="Your question"
            />
            <button type="submit" disabled={busy || !text.trim()}>
              Send
            </button>
          </form>
        </section>
      )}
      {!open && (
        <button type="button" className="cbc-assist-open" onClick={() => setOpen(true)}>
          Ask us
        </button>
      )}
    </div>
  );
}
