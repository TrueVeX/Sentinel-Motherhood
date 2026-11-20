"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, easeOutCubic, onFrame, pinProgress, range } from "@/lib/motion";

/**
 * Forty weeks, drawn as you scroll. The section pins while the four legs of the journey
 * ink themselves one after another, a glowing dot riding the leg being drawn; the week
 * and day counters tick up to 40 and 280 across the three trimesters.
 */

const SECTION_VH = 380;
const WINDOW = [0.06, 0.92] as const;

const START = { cx: 200, cy: 330 };
const BIRTH = { cx: 980, cy: 300, r: 58 };
const ORBIT = 76;

const LEGS = [
  // First trimester: a slow climb from day one.
  `M${START.cx} ${START.cy} C 250 190, 380 140, 470 220`,
  // Second trimester: the long middle stretch.
  `M470 220 C 560 300, 650 430, 760 370`,
  // Third trimester: up to the big day.
  `M760 370 C 850 320, 880 ${BIRTH.cy - ORBIT}, ${BIRTH.cx} ${BIRTH.cy - ORBIT}`,
  // After birth: a loop around the new arrival.
  `M${BIRTH.cx} ${BIRTH.cy - ORBIT} a${ORBIT} ${ORBIT} 0 1 1 -0.1 0`
];

// The same words as the Pregnancy and Baby Care pages.
const LEG_INFO = [
  { label: "Weeks 1–13", title: "First trimester", body: "Big changes on the inside. Baby’s organs form and you may feel tired or sick." },
  { label: "Weeks 14–27", title: "Second trimester", body: "Often the most comfortable stretch. Your bump grows and you may feel the first kicks." },
  { label: "Weeks 28–40", title: "Third trimester", body: "Baby grows fast and gets ready for birth. Time to prepare for the big day." },
  { label: "After birth", title: "The first weeks", body: "Feeding, sleep, bathing and knowing when to ask for help." }
];

const MARKERS = [
  { x: 470, y: 220, label: "WEEK 13", dy: -22 },
  { x: 760, y: 370, label: "WEEK 27", dy: 34 }
];

export default function Timeline() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const legRefs = useRef<SVGPathElement[]>([]);
  const dotRef = useRef<SVGGElement>(null);
  const weekRef = useRef<HTMLSpanElement>(null);
  const dayRef = useRef<HTMLSpanElement>(null);
  const [leg, setLeg] = useState(0);

  useEffect(() => {
    let lastP = -1;
    let current = 0;
    return onFrame(() => {
      const root = rootRef.current;
      const stage = stageRef.current;
      if (!root || !stage) return;
      const { p, rect, vh } = pinProgress(root, stage);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const u = range(p, ...WINDOW) * LEGS.length;
      const s = clamp(Math.floor(u), 0, LEGS.length - 1);
      if (s !== current) {
        current = s;
        setLeg(s);
      }
      legRefs.current.forEach((path, i) => {
        const k = easeOutCubic(clamp(u - i));
        path.style.strokeDashoffset = String(1 - k);
        if (i === s) {
          const pt = path.getPointAtLength(path.getTotalLength() * k);
          dotRef.current!.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        }
      });
      // Weeks and days only count across the three trimesters (the first three legs).
      const pregnancy = clamp(u / 3);
      weekRef.current!.textContent = String(Math.round(pregnancy * 40)).padStart(2, "0");
      dayRef.current!.textContent = String(Math.round(pregnancy * 280));
    });
  }, []);

  const info = LEG_INFO[leg];

  return (
    <section ref={rootRef} id="weeks" className="ld-timeline" aria-labelledby="timeline-title" style={{ height: `${SECTION_VH}svh` }}>
      <div ref={stageRef} className="ld-stage ld-timeline-stage">
        <div className="ld-timeline-head">
          <div>
            <p className="ld-label ld-accent">The journey</p>
            <h2 id="timeline-title" className="ld-display">Forty weeks, <em>drawn as you scroll.</em></h2>
          </div>
          <p className="ld-label ld-dim" aria-live="off">
            Week <span ref={weekRef} className="ld-white ld-num">00</span> / 40 · Day <span ref={dayRef} className="ld-white ld-num">0</span>
          </p>
        </div>

        <div className="ld-timeline-svg">
          <svg viewBox="0 0 1200 600" role="img" aria-label="The journey from day one to birth and the first weeks, drawn in four parts.">
            <defs>
              <radialGradient id="ld-birth" cx="40%" cy="38%" r="70%">
                <stop offset="0" stopColor="#F4F7F2" />
                <stop offset="0.65" stopColor="#A8CFC3" />
                <stop offset="1" stopColor="#247C78" />
              </radialGradient>
              <radialGradient id="ld-glow">
                <stop offset="0.6" stopColor="#A8CFC3" stopOpacity="0.35" />
                <stop offset="1" stopColor="#A8CFC3" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Faint star field. */}
            <g fill="#F4F7F2">
              {Array.from({ length: 70 }, (_, i) => (
                <circle key={i} cx={(i * 173) % 1200} cy={(i * 97) % 600} r={i % 7 === 0 ? 1.4 : 0.7} opacity={0.12 + ((i * 37) % 50) / 120} />
              ))}
            </g>

            {/* Day one: a tiny seed. */}
            <circle cx={START.cx} cy={START.cy} r="34" fill="url(#ld-glow)" />
            <circle cx={START.cx} cy={START.cy} r="9" fill="#A8CFC3" />

            {/* Birth: the new arrival. */}
            <circle cx={BIRTH.cx} cy={BIRTH.cy} r={BIRTH.r * 1.35} fill="url(#ld-glow)" />
            <circle cx={BIRTH.cx} cy={BIRTH.cy} r={BIRTH.r} fill="url(#ld-birth)" />
            <text x={BIRTH.cx} y={BIRTH.cy + 14} textAnchor="middle" fontSize="40" fill="#123F46">♡</text>

            {/* Ghost of the whole route, then the inked legs over it. */}
            {LEGS.map((d, i) => (
              <path key={`g${i}`} d={d} fill="none" stroke="#F4F7F2" strokeOpacity="0.12" strokeWidth="1.5" strokeDasharray="3 6" />
            ))}
            {LEGS.map((d, i) => (
              <path
                key={i}
                ref={(el) => {
                  if (el) legRefs.current[i] = el;
                }}
                d={d}
                pathLength={1}
                fill="none"
                stroke={i === 3 ? "#A8CFC3" : "#F4F7F2"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="1 1"
                strokeDashoffset="1"
              />
            ))}

            {MARKERS.map((m) => (
              <g key={m.label}>
                <circle cx={m.x} cy={m.y} r="4" fill="#A8CFC3" />
                <text x={m.x} y={m.y + m.dy} textAnchor="middle" fontSize="12" letterSpacing="2" fill="#A8CFC3" opacity="0.8">{m.label}</text>
              </g>
            ))}

            <g ref={dotRef} transform={`translate(${START.cx} ${START.cy})`}>
              <circle r="12" fill="#A8CFC3" opacity="0.3" />
              <circle r="5" fill="#F4F7F2" />
            </g>

            <g fontSize="13" letterSpacing="3" fill="#A8CFC3">
              <text x={START.cx} y={START.cy + 64} textAnchor="middle">DAY ONE</text>
              <text x={BIRTH.cx} y={BIRTH.cy + BIRTH.r + 66} textAnchor="middle">BIRTH</text>
            </g>
          </svg>
        </div>

        {/* The part being drawn right now. */}
        <div className="ld-timeline-foot">
          <p className="ld-label ld-accent">
            {info.label} · Part {leg + 1}/{LEG_INFO.length}
          </p>
          <div key={leg} className="ld-leg-in" aria-live="polite">
            <h3>{info.title}</h3>
            <p className="ld-body">{info.body}</p>
          </div>
          <div className="ld-leg-dots" aria-hidden="true">
            {LEG_INFO.map((_, i) => (
              <span key={i} className={i <= leg ? "on" : ""} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
