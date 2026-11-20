import Link from "next/link";
import { redirect } from "next/navigation";
import { JOURNEYS, pregnancyWeek, requireUser, type User } from "@/lib/auth";
import { MILESTONES, MOTHER_CARE, NEWBORN_CARE, WEEKS } from "@/lib/content";
import { notificationsFor } from "@/lib/notify";
import { appointmentsFor, isUpcoming, listPosts, type Appointment } from "@/lib/records";
import PageHead from "../PageHead";
import ChecklistProgress from "./ChecklistProgress";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function AppointmentsCard({ appointments }: { appointments: Appointment[] }) {
  const upcoming = appointments.filter(isUpcoming).slice(0, 3);
  return (
    <div className="dash-card">
      <h3>Upcoming appointments</h3>
      {upcoming.length ? (
        <ul className="dash-list">
          {upcoming.map((a) => (
            <li key={a.id}>
              <Link href={`/appointments/${a.id}`}>
                <strong>{a.title}</strong>
                <small>{formatDate(a.date)}{a.time ? ` · ${a.time}` : ""}</small>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dash-empty">Nothing booked yet.</p>
      )}
      <Link className="text-link" href="/appointments">Manage appointments <span>→</span></Link>
    </div>
  );
}

function QuickLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <div className="dash-card">
      <h3>Quick links</h3>
      <div className="quick-links">
        {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
      </div>
    </div>
  );
}

function babyAgeMonths(user: User) {
  if (!user.babyBirthDate) return null;
  const born = new Date(`${user.babyBirthDate}T00:00:00`);
  const months = (Date.now() - born.getTime()) / (30.44 * 86400000);
  return months >= 0 && months < 60 ? Math.floor(months) : null;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const user = await requireUser();
  const { notice } = await searchParams;
  if (!user.onboarded) redirect("/onboarding");
  if (user.role === "admin" && notice !== "no-access") redirect("/admin");

  const [appointments, notes] = await Promise.all([appointmentsFor(user.id), notificationsFor(user.id)]);
  const first = user.name.split(" ")[0];
  const banner = notice === "no-access" && (
    <p className="notice" role="alert">You don’t have access to that page, so we brought you to your dashboard.</p>
  );
  const recentNotes = notes.slice(0, 3);
  const notesCard = (
    <div className="dash-card">
      <h3>Notifications</h3>
      {recentNotes.length ? (
        <ul className="dash-list">
          {recentNotes.map((n) => (
            <li key={n.id}>
              <a href={`/notifications/open/${n.id}`}>
                <strong className={n.read ? "" : "unread"}>{n.text}</strong>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dash-empty">You’re all caught up.</p>
      )}
      <Link className="text-link" href="/notifications">All notifications <span>→</span></Link>
    </div>
  );

  // ---- Healthcare professional dashboard ----
  if (user.role === "professional") {
    const posts = await listPosts();
    const unanswered = posts.filter((p) => p.replies.length === 0).slice(0, 5);
    return (
      <>
        <PageHead eyebrow="PROFESSIONAL DASHBOARD" title={<>Welcome, <em>{first}.</em></>} text="Help mothers in the community with your knowledge." />
        <div className="section-wrap page-body">
          {banner}
          <div className="dash-grid">
            <div className="dash-card span-2">
              <h3>Community questions waiting for an answer</h3>
              {unanswered.length ? (
                <ul className="dash-list">
                  {unanswered.map((p) => (
                    <li key={p.id}>
                      <Link href={`/community#post-${p.id}`}><strong>{p.title}</strong><small>by {p.authorName}</small></Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="dash-empty">Every question has a reply. 🎉</p>
              )}
              <Link className="text-link" href="/community">Open the community <span>→</span></Link>
            </div>
            <div className="dash-card">
              <h3>Community</h3>
              <p className="dash-big">{posts.length}</p>
              <small>questions and posts in total</small>
            </div>
            {notesCard}
            <QuickLinks links={[{ href: "/mother-care", label: "Mother care" }, { href: "/newborn-care", label: "Baby care" }, { href: "/ai-assistant", label: "AI assistant" }, { href: "/emergency", label: "Emergency info" }]} />
          </div>
        </div>
      </>
    );
  }

  const journey = user.journey ?? "pregnancy";
  const head = (
    <PageHead
      eyebrow={JOURNEYS[journey].title.toUpperCase()}
      title={<>Hello, <em>{first}.</em></>}
      text={JOURNEYS[journey].text}
    />
  );
  const switchLink = <p className="switch-journey">Not the right journey? <Link href="/onboarding">Change it</Link></p>;

  // ---- Pregnancy journey ----
  if (journey === "pregnancy") {
    const week = pregnancyWeek(user);
    const w = week ? WEEKS[Math.min(40, week) - 1] : null;
    return (
      <>
        {head}
        <div className="section-wrap page-body">
          {banner}
          <div className="dash-grid">
            {w ? (
              <Link href={`/pregnancy/week/${w.week}`} className="dash-card span-2 feature">
                <span className="dash-emoji">{w.emoji}</span>
                <h3>Week {week} · Trimester {w.trimester}</h3>
                <p>Your baby is about the size of <strong>{w.size}</strong>. {w.baby}</p>
                <div className="progress"><span style={{ width: `${(Math.min(40, week!) / 40) * 100}%` }} /></div>
                <small>{Math.max(0, 40 - week!)} weeks to go · see this week →</small>
              </Link>
            ) : (
              <Link href="/profile" className="dash-card span-2 feature">
                <span className="dash-emoji">◷</span>
                <h3>Add your due date</h3>
                <p>Add it to your profile and your dashboard will show your pregnancy week and baby’s size.</p>
              </Link>
            )}
            <AppointmentsCard appointments={appointments} />
            {notesCard}
            <div className="dash-card">
              <h3>Milestones ahead</h3>
              <ul className="dash-list">
                {[20, 28, 37, 40].filter((m) => !week || m > week).slice(0, 3).map((m) => (
                  <li key={m}><Link href={`/pregnancy/week/${m}`}><strong>Week {m}</strong><small>{WEEKS[m - 1].baby.split(".")[0]}.</small></Link></li>
                ))}
              </ul>
            </div>
            <QuickLinks links={[{ href: "/baby-development", label: "Baby development" }, { href: "/journal", label: "My journal" }, { href: "/tools/due-date", label: "Due date tool" }, { href: "/ai-assistant", label: "Ask the AI" }]} />
          </div>
          {switchLink}
        </div>
      </>
    );
  }

  // ---- Birth journey ----
  if (journey === "birth") {
    const due = user.dueDate ? Math.ceil((new Date(`${user.dueDate}T00:00:00`).getTime() - Date.now()) / 86400000) : null;
    return (
      <>
        {head}
        <div className="section-wrap page-body">
          {banner}
          <div className="dash-grid">
            <div className="dash-card feature">
              <span className="dash-emoji">⌂</span>
              <h3>{due === null ? "Add your due date" : due > 0 ? `${due} days to go` : "Your due date is here!"}</h3>
              <p>{due === null ? <>Set it in your <Link href="/profile">profile</Link> for a countdown.</> : "Pack your bag, plan your journey and save your important numbers."}</p>
            </div>
            <ChecklistProgress />
            <AppointmentsCard appointments={appointments} />
            {notesCard}
            <QuickLinks links={[{ href: "/emergency", label: "Nearby hospitals" }, { href: "/mother-care#postpartum-recovery", label: "Recovery after birth" }, { href: "/ai-assistant?q=What%20are%20the%20signs%20of%20labour%3F", label: "Signs of labour" }, { href: "/journal", label: "My journal" }]} />
          </div>
          {switchLink}
        </div>
      </>
    );
  }

  // ---- Motherhood journey ----
  const months = babyAgeMonths(user);
  const stage = months === null ? null : MILESTONES[months < 3 ? 0 : months < 5 ? 1 : months < 7 ? 2 : months < 10 ? 3 : months < 12 ? 4 : 5];
  return (
    <>
      {head}
      <div className="section-wrap page-body">
        {banner}
        <div className="dash-grid">
          {stage ? (
            <Link href="/baby-development" className="dash-card span-2 feature">
              <span className="dash-emoji">☼</span>
              <h3>Your baby is {months} month{months === 1 ? "" : "s"} old</h3>
              <p>Around {stage.age}, many babies:</p>
              <ul className="tick-list">{stage.items.map((i) => <li key={i}>{i}</li>)}</ul>
              <small>Every baby develops at their own pace · see all milestones →</small>
            </Link>
          ) : (
            <Link href="/profile" className="dash-card span-2 feature">
              <span className="dash-emoji">☼</span>
              <h3>Add your baby’s birth date</h3>
              <p>Add it to your profile and your dashboard will show your baby’s age and milestones.</p>
            </Link>
          )}
          <div className="dash-card">
            <h3>Feeding & care</h3>
            <ul className="dash-list">
              {NEWBORN_CARE.slice(0, 3).map((a) => (
                <li key={a.slug}><Link href={`/newborn-care#${a.slug}`}><strong>{a.title}</strong><small>{a.summary}</small></Link></li>
              ))}
            </ul>
          </div>
          <AppointmentsCard appointments={appointments} />
          {notesCard}
          <QuickLinks links={[{ href: `/mother-care#${MOTHER_CARE[3].slug}`, label: "Your wellbeing" }, { href: "/journal", label: "My journal" }, { href: "/community", label: "Community" }, { href: "/ai-assistant", label: "Ask the AI" }]} />
        </div>
        {switchLink}
      </div>
    </>
  );
}
