import Link from "next/link";
import { pregnancyWeek, requireUser } from "@/lib/auth";
import { notificationsFor } from "@/lib/notify";
import { appointmentsFor, isUpcoming } from "@/lib/records";
import { readAllNotifications } from "../actions/records";
import PageHead from "../PageHead";

export default async function NotificationsPage() {
  const user = await requireUser();
  const [notes, appts] = await Promise.all([notificationsFor(user.id), appointmentsFor(user.id)]);
  const soon = appts.filter(isUpcoming).filter((a) => new Date(`${a.date}T00:00:00`).getTime() - Date.now() < 7 * 86400000);
  const week = pregnancyWeek(user);

  return (
    <>
      <PageHead eyebrow="NOTIFICATIONS" title={<>What’s <em>new.</em></>} />
      <div className="section-wrap page-body narrow">
        {(soon.length > 0 || week) && (
          <div className="reminders">
            <h2 className="block-title">Reminders</h2>
            <ul className="note-list">
              {week && week <= 40 && (
                <li><Link href={`/pregnancy/week/${week}`}>📅 You’re in week {week}. See what’s happening this week.</Link></li>
              )}
              {soon.map((a) => (
                <li key={a.id}><Link href={`/appointments/${a.id}`}>⏰ Coming up: {a.title} on {a.date}{a.time ? ` at ${a.time}` : ""}</Link></li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-buttons">
          <h2 className="block-title">All notifications</h2>
          {notes.some((n) => !n.read) && (
            <form action={readAllNotifications}><button className="link-button">Mark all as read</button></form>
          )}
        </div>
        {notes.length ? (
          <ul className="note-list">
            {notes.map((n) => (
              <li key={n.id} className={n.read ? "" : "unread"}>
                <a href={`/notifications/open/${n.id}`}>
                  <span>{n.text}</span>
                  <small>{new Date(n.createdAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dash-empty">No notifications yet.</p>
        )}
      </div>
    </>
  );
}
