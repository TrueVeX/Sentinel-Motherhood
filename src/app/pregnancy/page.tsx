import Link from "next/link";
import { getCurrentUser, pregnancyWeek } from "@/lib/auth";
import { WEEKS } from "@/lib/content";
import PageHead from "../PageHead";

const TRIMESTERS = [
  { n: 1, title: "First trimester", weeks: "Weeks 1–13", text: "Big changes on the inside. Baby’s organs form and you may feel tired or sick." },
  { n: 2, title: "Second trimester", weeks: "Weeks 14–27", text: "Often the most comfortable stretch. Your bump grows and you may feel the first kicks." },
  { n: 3, title: "Third trimester", weeks: "Weeks 28–40", text: "Baby grows fast and gets ready for birth. Time to prepare for the big day." }
];

export default async function PregnancyPage() {
  const user = await getCurrentUser();
  const week = user ? pregnancyWeek(user) : null;
  const shown = week ? WEEKS[Math.min(40, week) - 1] : null;

  return (
    <>
      <PageHead eyebrow="PREGNANCY DASHBOARD" title={<>Your pregnancy, <em>week by week.</em></>} text="Pick a week to see how your baby is growing and what you might notice." />
      <div className="section-wrap page-body">
        {shown ? (
          <Link href={`/pregnancy/week/${shown.week}`} className="highlight-card">
            <span className="highlight-emoji">{shown.emoji}</span>
            <span>
              <strong>You’re in week {week}</strong>
              <small>Your baby is about the size of {shown.size}. See this week →</small>
            </span>
          </Link>
        ) : (
          <div className="highlight-card muted">
            <span className="highlight-emoji">◷</span>
            <span>
              <strong>Want this personalised?</strong>
              <small>
                {user ? <>Add your due date in your <Link href="/profile">profile</Link></> : <><Link href="/signup?journey=pregnancy">Create an account</Link> and add your due date</>}
                {" "}or try the <Link href="/tools/due-date">due date tool</Link>.
              </small>
            </span>
          </div>
        )}

        {TRIMESTERS.map((t) => (
          <section key={t.n} className="trimester-block">
            <div className="trimester-head">
              <h2>{t.title}</h2>
              <span>{t.weeks}</span>
            </div>
            <p>{t.text}</p>
            <div className="week-chips">
              {WEEKS.filter((w) => w.trimester === t.n).map((w) => (
                <Link key={w.week} href={`/pregnancy/week/${w.week}`} className={week === w.week ? "week-chip current" : "week-chip"}>
                  <span>{w.emoji}</span>{w.week}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
