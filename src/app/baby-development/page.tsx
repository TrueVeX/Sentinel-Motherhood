import Link from "next/link";
import { MILESTONES, WEEKS } from "@/lib/content";
import PageHead from "../PageHead";

export default function BabyDevelopmentPage() {
  return (
    <>
      <PageHead eyebrow="WEEK-BY-WEEK BABY DEVELOPMENT" title={<>Watch your baby <em>grow.</em></>} text="Tap any week to see what’s happening, then follow the milestones after birth." />
      <div className="section-wrap page-body">
        <h2 className="block-title">Before birth</h2>
        <div className="size-grid">
          {WEEKS.filter((w) => w.week >= 4).map((w) => (
            <Link key={w.week} href={`/pregnancy/week/${w.week}`} className="size-card">
              <span className="size-emoji">{w.emoji}</span>
              <strong>Week {w.week}</strong>
              <small>{w.size}</small>
            </Link>
          ))}
        </div>

        <h2 className="block-title">After birth: milestones</h2>
        <p className="block-note">Every child develops at their own pace. These are common examples, not deadlines.</p>
        <ol className="milestone-line">
          {MILESTONES.map((m) => (
            <li key={m.age}>
              <strong>{m.age}</strong>
              <ul>{m.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
