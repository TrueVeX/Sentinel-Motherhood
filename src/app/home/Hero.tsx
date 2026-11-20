"use client";

import { useEffect, useRef } from "react";
import { clamp, easeOutCubic, lerp, onFrame, pinProgress, range } from "@/lib/motion";
import { useReducedMotion } from "./hooks";

/**
 * Sunrise. Six drawn layers, stacked and pinned; one scroll range moves each at its own rate:
 *
 *   0.00 – 0.18  a soft morning mist drifts off the view
 *   0.04 – 0.50  the sun climbs out from behind the hills
 *   0.08 – 0.50  SENTINEL resolves (letter-spacing closes in, blur clears)
 *   0.28 – 0.60  the near hills close in around the view; mother and baby rise
 *   0.70 – 1.00  everything lifts away and the ground fills the frame,
 *                handing straight over to the next section
 */

const STAGE_VH = 440;
type LayerName = "sky" | "sun" | "far" | "frame" | "figure" | "ground";
type Mote = { x: number; y: number; r: number; s: number; a: number };

// Fixed star positions so the server and browser render the same sky.
const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: (i * 37.3) % 100,
  top: (i * 23.7) % 46,
  size: i % 6 === 0 ? 3 : 2,
  opacity: 0.25 + ((i * 29) % 50) / 100
}));

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Partial<Record<LayerName, HTMLDivElement>>>({});
  const veilRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const weekRef = useRef<HTMLSpanElement>(null);
  const stageNoRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  // Keep the mist canvas sharp at any size.
  useEffect(() => {
    const c = mistRef.current!;
    const sync = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = mistRef.current!;
    const ctx = canvas.getContext("2d")!;
    let seed = 11;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const motes: Mote[] = Array.from({ length: 140 }, () => ({
      x: rand(),
      y: rand(),
      r: 0.4 + rand() * 1.6,
      s: 0.3 + rand(),
      a: 0.2 + rand() * 0.6
    }));
    let lastP = -1;
    let lastTime = 0;

    const set = (name: LayerName, y: number, scale = 1, opacity = 1) => {
      const el = layerRefs.current[name];
      if (!el) return;
      el.style.transform = `translate3d(0, ${y}vh, 0) scale(${scale})`;
      el.style.opacity = String(opacity);
    };

    return onFrame((time) => {
      const dt = lastTime ? Math.min(0.1, (time - lastTime) / 1000) : 1 / 60;
      lastTime = time;
      const root = rootRef.current;
      const stage = stageRef.current;
      if (!root || !stage) return;
      const { p, rect, vh } = pinProgress(root, stage);
      if (rect.bottom < 0 || rect.top > vh) return;

      // The mist drifts every frame while it's visible.
      const veil = 1 - range(p, 0, 0.18);
      if (veil > 0.001) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const dpr = canvas.width / Math.max(1, w);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#F4F7F2";
        for (const m of motes) {
          if (!reducedRef.current) {
            m.x += 0.006 * m.s * dt;
            m.y -= 0.004 * m.s * dt;
            if (m.x > 1) m.x -= 1;
            if (m.y < 0) m.y += 1;
          }
          ctx.globalAlpha = m.a * veil;
          ctx.beginPath();
          ctx.arc(m.x * w, (m.y - p * 0.6) * h, m.r * (1 + p * 4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else if (canvas.style.opacity !== "0") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const exit = range(p, 0.7, 1);
      const settle = easeOutCubic(range(p, 0, 0.5));

      // Mist clears upward.
      veilRef.current!.style.opacity = String(veil);
      veilRef.current!.style.transform = `translate3d(0, ${-range(p, 0, 0.18) * 24}vh, 0) scale(${1 + range(p, 0, 0.18) * 0.25})`;
      canvas.style.opacity = String(veil);

      // Far → near, each faster than the one behind it.
      set("sky", lerp(0, -6, p), lerp(1.14, 1, settle));
      const rise = easeOutCubic(range(p, 0.04, 0.5));
      set("sun", lerp(34, 0, rise) - exit * 12, lerp(0.92, 1, rise));
      set("far", lerp(9, 0, settle) - exit * 26);
      const rim = easeOutCubic(range(p, 0.28, 0.58));
      set("frame", -exit * 44, lerp(1.6, 1, rim), rim);
      const up = easeOutCubic(range(p, 0.36, 0.62));
      set("figure", lerp(28, 0, up) - exit * 58, 1, clamp(up * 2));
      const ground = easeOutCubic(range(p, 0.34, 0.6));
      set("ground", lerp(36, 0, ground) - exit * 78);

      // Title: resolves (letter-spacing closes in, blur clears), then yields to the hills.
      const tIn = easeOutCubic(range(p, 0.08, 0.24));
      const tOut = range(p, 0.42, 0.52);
      const title = titleRef.current!;
      title.style.opacity = String(tIn * (1 - tOut));
      title.style.setProperty("--track", `${lerp(0.6, 0.24, tIn)}em`);
      title.style.transform = `translate3d(0, ${-p * 6}vh, 0)`;
      title.style.filter = tIn < 0.99 ? `blur(${(1 - tIn) * 10}px)` : "";

      // Corner readouts: pregnancy week 0 → 40 as the sun rises, and the six stages.
      hudRef.current!.style.opacity = String(range(p, 0.02, 0.1) * (1 - range(p, 0.62, 0.72)));
      weekRef.current!.textContent = String(Math.round(rise * 40)).padStart(2, "0");
      stageNoRef.current!.textContent = `0${Math.min(6, 1 + Math.floor(range(p, 0.05, 0.65) * 6))}`;
    });
  }, []);

  const layer = (name: LayerName, children: React.ReactNode) => (
    <div
      ref={(el) => {
        if (el) layerRefs.current[name] = el;
      }}
      className="ld-layer"
      aria-hidden="true"
    >
      {children}
    </div>
  );

  return (
    <section ref={rootRef} className="ld-hero" aria-label="Sentinel Motherhood" style={{ height: `${STAGE_VH}svh` }}>
      <div ref={stageRef} className="ld-stage">
        {layer(
          "sky",
          <div className="ld-sky">
            {STARS.map((s, i) => (
              <span key={i} style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, opacity: s.opacity }} />
            ))}
          </div>
        )}
        {layer("sun", <div className="ld-sun" />)}
        {layer(
          "far",
          <svg className="ld-far" viewBox="0 0 1440 400" preserveAspectRatio="none">
            <path className="ld-far-back" d="M0 150 C 160 90 300 110 450 140 C 610 172 730 92 900 80 C 1070 68 1230 132 1440 104 L1440 400 L0 400 Z" />
            <path className="ld-far-front" d="M0 230 C 180 150 330 170 480 205 C 640 242 770 168 930 160 C 1090 152 1250 214 1440 190 L1440 400 L0 400 Z" />
          </svg>
        )}

        {/* The name sits between the far hills and the near ones. */}
        <div ref={titleRef} className="ld-title" style={{ opacity: 0 }}>
          <h1>SENTINEL</h1>
          <p>Guiding motherhood, nurturing generations.</p>
        </div>

        {layer(
          "frame",
          <svg className="ld-frame" viewBox="0 0 1440 900" preserveAspectRatio="none">
            <path d="M0 0 C 110 110 170 260 150 420 C 132 570 210 760 300 900 L0 900 Z" />
            <path d="M1440 0 C 1330 120 1280 280 1300 430 C 1318 590 1240 770 1150 900 L1440 900 Z" />
          </svg>
        )}
        {layer(
          "figure",
          <div className="ld-figure">
            <div className="mother-art">
              <div className="hair" />
              <div className="mother-face" />
              <div className="mother-neck" />
              <div className="mother-body" />
              <div className="mother-arm" />
              <div className="baby-body" />
              <div className="baby-head" />
              <div className="baby-hair" />
              <div className="baby-blanket" />
            </div>
          </div>
        )}
        {layer(
          "ground",
          <>
            <svg className="ld-ground" viewBox="0 0 1440 300" preserveAspectRatio="none">
              <path d="M0 120 C 240 62 420 42 620 72 C 820 102 1000 40 1200 58 C 1320 70 1400 88 1440 98 L1440 300 L0 300 Z" />
            </svg>
            {/* A deep apron below the ground: when it climbs it fills the screen and hands
                straight over to the section below. */}
            <div className="ld-apron" />
          </>
        )}

        {/* Morning mist over the view. */}
        <div ref={veilRef} className="ld-veil" aria-hidden="true">
          <div className="ld-veil-copy">
            <p className="ld-label">A companion through motherhood</p>
            <p className="ld-veil-cta">Scroll to begin the journey</p>
            <span className="ld-bounce">↓</span>
          </div>
        </div>
        <canvas ref={mistRef} className="ld-mist" aria-hidden="true" />

        {/* Corner readouts. */}
        <div ref={hudRef} className="ld-hud" aria-hidden="true" style={{ opacity: 0 }}>
          <div className="ld-brackets" />
          <div className="ld-hud-tl">
            <p>Week <span ref={weekRef} className="ld-hud-value">00</span> / 40</p>
            <p className="ld-hud-dim">Pregnancy week</p>
          </div>
          <div className="ld-hud-tr">
            <p>Stage <span ref={stageNoRef} className="ld-hud-value">01</span> / 06</p>
            <p className="ld-hud-dim">Here for every chapter</p>
          </div>
          <div className="ld-hud-bl">Made for mothers · Helpful for the whole family</div>
          <div className="ld-hud-br">Scroll <span className="ld-bounce">↓</span></div>
        </div>
      </div>
    </section>
  );
}
