"use client";

import Link from "next/link";
import { useReveals } from "./hooks";

/** The three journeys. Each card carries its stages as a set of orbit rings. */
const JOURNEYS = [
  {
    key: "pregnancy",
    name: "Pregnancy",
    number: "40",
    unit: "weeks",
    rings: 3,
    lines: ["Week-by-week tracking", "Baby’s size every week", "Pregnancy milestones"]
  },
  {
    key: "birth",
    name: "Birth",
    number: "1",
    unit: "big day",
    rings: 1,
    lines: ["Due-date countdown", "Hospital bag checklist", "Appointments and nearby hospitals"]
  },
  {
    key: "motherhood",
    name: "Motherhood",
    number: "18",
    unit: "months of milestones",
    rings: 6,
    lines: ["Newborn care", "Feeding guidance", "Baby development milestones"]
  }
];

export default function Journeys({ signedIn }: { signedIn: boolean }) {
  const ref = useReveals<HTMLElement>();
  return (
    <section ref={ref} id="journeys" className="ld-journeys" aria-labelledby="journeys-title">
      <div className="ld-journeys-head" data-reveal>
        <div>
          <p className="ld-label ld-teal">Choose your journey</p>
          <h2 id="journeys-title" className="ld-display ld-deep">A dashboard made <em>for you.</em></h2>
        </div>
        <p className="ld-label ld-muted">Free account · Private to you</p>
      </div>

      <ol className="ld-journey-grid">
        {JOURNEYS.map((j, i) => (
          <li key={j.key} data-reveal style={{ transitionDelay: `${i * 110}ms` }} className={i === 0 ? "ld-journey featured" : "ld-journey"}>
            <svg aria-hidden="true" viewBox="0 0 200 200" className="ld-orbits">
              {Array.from({ length: j.rings }, (_, k) => (
                <ellipse key={k} cx="100" cy="100" rx={40 + k * 12} ry={18 + k * 6} fill="none" stroke="currentColor" transform={`rotate(${-20 + k * 14} 100 100)`} />
              ))}
              <circle cx="100" cy="100" r="9" fill="currentColor" />
            </svg>
            <h3>{j.name}</h3>
            <p className="ld-journey-number">
              <span>{j.number}</span>
              <span className="ld-label ld-muted">{j.unit}</span>
            </p>
            <ul>
              {j.lines.map((l) => (
                <li key={l}>
                  <span aria-hidden="true" />
                  {l}
                </li>
              ))}
            </ul>
            <Link href={signedIn ? "/dashboard" : `/signup?journey=${j.key}`} className="ld-journey-cta">
              {signedIn ? "Go to my dashboard" : `Start the ${j.name.toLowerCase()} journey`}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
