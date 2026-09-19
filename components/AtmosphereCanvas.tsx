"use client";

import { useEffect, useRef } from "react";

// The homepage's rain layer. Three depth layers of droplets (far/mid/near)
// give it real parallax instead of one flat field of dots, and everything
// is driven by delta-time so it looks the same at 60Hz or 120Hz instead of
// speeding up or slowing down with the screen's refresh rate. Droplet
// shapes are pre-rendered once to an offscreen canvas and stamped per
// frame instead of building anything per drop per frame — kept
// deliberately light: low drop counts, no per-frame gradients, no canvas
// filters, capped pixel ratio. This runs on the homepage of every visit,
// including older/weaker laptops, so cheap beats fancy here.

type Drop = {
  x: number; // 0..1, relative to width
  y: number; // 0..1, relative to height
  r: number; // radius in px
  v: number; // fall speed, px/sec at r=1
  layer: 0 | 1 | 2; // 0 = far (small, slow, faint) .. 2 = near (big, fast, bright)
};

const LAYER_COUNT = [18, 12, 6] as const; // far, mid, near — trimmed hard for low-end hardware
const LAYER_SPEED = [26, 54, 96] as const; // px/sec baseline
const LAYER_ALPHA = [0.14, 0.28, 0.48] as const;

function buildDropSprite(): HTMLCanvasElement {
  const size = 64;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;
  const g = ctx.createRadialGradient(cx - 6, cy - 8, 2, cx, cy, size / 2);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.35, "rgba(225,246,255,0.55)");
  g.addColorStop(1, "rgba(225,246,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();
  return sprite;
}

export default function AtmosphereCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // CSS also hides the canvas's parent video etc.
    /* Phones and tablets skip the rain: a frame loop running under someone's
       thumb costs battery and scroll smoothness, and on a small screen it
       barely shows. Desktop keeps it. */
    if (matchMedia("(max-width: 850px), (pointer: coarse)").matches) return;

    const sprite = buildDropSprite();

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastTime = 0;
    let running = true;

    const drops: Drop[] = [];
    LAYER_COUNT.forEach((count, layer) => {
      for (let i = 0; i < count; i++) {
        drops.push(makeDrop(layer as 0 | 1 | 2));
      }
    });

    function makeDrop(layer: 0 | 1 | 2, atTop = false): Drop {
      return {
        x: Math.random(),
        y: atTop ? -Math.random() * 0.1 : Math.random(),
        r: (layer + 1) * (1.1 + Math.random() * 1.3),
        v: LAYER_SPEED[layer] * (0.75 + Math.random() * 0.5),
        layer,
      };
    }

    function resize() {
      // Capped lower than device pixel ratio on purpose — this canvas
      // redraws every frame, so on a 3x display that's 3x the pixels for
      // no visible gain on a rain layer.
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = width + "px";
      canvas!.style.height = height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function onVisibility() {
      running = document.visibilityState === "visible";
      if (running) {
        lastTime = 0; // avoid a huge delta-time jump after being backgrounded
        raf = requestAnimationFrame(draw);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    function draw(time: number) {
      if (!running) return;
      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.05); // clamp for tab-switch jumps
      lastTime = time;

      ctx!.clearRect(0, 0, width, height);

      for (const d of drops) {
        d.y += ((d.v * dt) / height) * (0.6 + d.r * 0.18);
        if (d.y > 1.04) Object.assign(d, makeDrop(d.layer, true));

        const px = d.x * width;
        const py = d.y * height;
        const size = d.r * 5.2;

        ctx!.globalAlpha = LAYER_ALPHA[d.layer];
        ctx!.drawImage(sprite, px - size / 2, py - size / 2, size, size);
      }
      ctx!.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="rainCanvas" aria-hidden="true" />;
}
