import Link from "next/link";
import { notFound } from "next/navigation";
import { WEEKS } from "@/lib/content";
import PageHead from "../../../PageHead";

export function generateStaticParams() {
  return WEEKS.map((w) => ({ week: String(w.week) }));
}

export async function generateMetadata({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  return { title: `Week ${week} of pregnancy | Sentinel Motherhood` };
}

export default async function WeekPage({ params }: { params: Promise<{ week: string }> }) {
  const { week: raw } = await params;
  const n = Number(raw);
  if (!/^\d{1,2}$/.test(raw) || n < 1 || n > 40) notFound();
  const w = WEEKS[n - 1];

  return (
    <>
      <PageHead eyebrow={`TRIMESTER ${w.trimester}`} title={<>Week <em>{w.week}</em></>} crumbs={[{ href: "/pregnancy", label: "Pregnancy" }]} />
      <div className="section-wrap page-body">
        <div className="week-hero">
          <div className="week-size">
            <span className="week-emoji">{w.emoji}</span>
            <small>About the size of</small>
            <strong>{w.size}</strong>
            <em>Sizes are approximate</em>
          </div>
          <div className="week-text">
            <h2>Your baby this week</h2>
            <p>{w.baby}</p>
            <h2>You this week</h2>
            <p>{w.mother}</p>
            <Link className="text-link" href={`/ai-assistant?q=${encodeURIComponent(`What happens in week ${w.week} of pregnancy?`)}`}>
              Ask the AI assistant about week {w.week} <span>↗</span>
            </Link>
          </div>
        </div>
        <div className="week-progress" aria-label={`Week ${w.week} of 40`}>
          <span style={{ width: `${(w.week / 40) * 100}%` }} />
        </div>
        <nav className="week-nav" aria-label="Other weeks">
          {w.week > 1 ? <Link href={`/pregnancy/week/${w.week - 1}`}>← Week {w.week - 1}</Link> : <span />}
          <Link href="/pregnancy">All weeks</Link>
          {w.week < 40 ? <Link href={`/pregnancy/week/${w.week + 1}`}>Week {w.week + 1} →</Link> : <span />}
        </nav>
      </div>
    </>
  );
}
