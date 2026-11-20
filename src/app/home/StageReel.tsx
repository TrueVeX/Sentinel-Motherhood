"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { clamp, onFrame, pinProgress, range } from "@/lib/motion";
import { stages } from "../data";

/**
 * The six stages as a reel. The section pins and the reel slides sideways with the scroll;
 * the card nearest the focus line is sharp, the rest dim back, and each picture drifts
 * against its frame.
 */

const SECTION_VH = 340;

// Where each stage card leads.
const STAGE_PAGES: Record<string, string> = {
  "01": "/pregnancy",
  "02": "/pregnancy",
  "03": "/tools/hospital-checklist",
  "04": "/mother-care",
  "05": "/newborn-care",
  "06": "/baby-development"
};

export default function StageReel() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<HTMLLIElement[]>([]);
  const artRefs = useRef<HTMLDivElement[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastP = -1;
    return onFrame(() => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const track = trackRef.current;
      if (!root || !stage || !track) return;
      const { p, rect, vh } = pinProgress(root, stage);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const vw = document.documentElement.clientWidth;
      const k = range(p, 0.04, 0.96);
      // offsetLeft is the untransformed layout position, so this stays stable
      // while the track itself is being moved.
      const travel = Math.max(0, track.offsetLeft + track.scrollWidth - vw * 0.94);
      track.style.transform = `translate3d(${-k * travel}px, 0, 0)`;

      let nearest = 0;
      let best = Infinity;
      cardRefs.current.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const off = (r.left + r.width / 2 - vw * 0.62) / vw; // focus line right of centre
        const a = clamp(Math.abs(off) * 1.6);
        card.style.opacity = String(1 - a * 0.55);
        card.style.transform = `scale(${1 - a * 0.07})`;
        const art = artRefs.current[i];
        if (art) art.style.transform = `translate3d(${off * -60}px, 0, 0) scale(1.15)`;
        if (Math.abs(off) < best) {
          best = Math.abs(off);
          nearest = i;
        }
      });
      barRef.current!.style.transform = `scaleX(${k})`;
      countRef.current!.textContent = `0${nearest + 1}`;
    });
  }, []);

  return (
    <section ref={rootRef} id="journey" className="ld-reel" aria-labelledby="reel-title" style={{ height: `${SECTION_VH}svh` }}>
      <div ref={stageRef} className="ld-stage ld-reel-stage">
        <div className="ld-reel-intro">
          <p className="ld-label ld-accent">Your journey, your pace</p>
          <h2 id="reel-title" className="ld-display">Here for every <em>chapter.</em></h2>
          <p className="ld-body ld-hide-sm">Motherhood doesn’t happen all at once. Explore the stage that matters to you today.</p>
          <div className="ld-reel-count ld-hide-sm" aria-hidden="true">
            <span><span ref={countRef} className="ld-white">01</span> / 0{stages.length}</span>
            <span className="ld-reel-bar"><span ref={barRef} style={{ transform: "scaleX(0)" }} /></span>
          </div>
        </div>

        <ol ref={trackRef} className="ld-reel-track">
          {stages.map((stage, i) => (
            <li
              key={stage.number}
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              className="ld-reel-card"
            >
              <Link href={STAGE_PAGES[stage.number] ?? "/"} aria-label={`${stage.title}: ${stage.description}`}>
                <div className={`ld-reel-pic tone-${i % 3}`}>
                  <div
                    ref={(el) => {
                      if (el) artRefs.current[i] = el;
                    }}
                    className="ld-reel-art"
                    aria-hidden="true"
                  >
                    <span className="ring r1" />
                    <span className="ring r2" />
                    <span className="ring r3" />
                    <span className="ld-reel-icon">{stage.icon}</span>
                  </div>
                  <span className="ld-reel-tag">Stage {stage.number}</span>
                </div>
                <div className="ld-reel-caption">
                  <span className="ld-label ld-accent">{stage.number}</span>
                  <span>
                    <span className="ld-reel-name">{stage.title}</span>
                    <span className="ld-reel-text">{stage.description}</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
