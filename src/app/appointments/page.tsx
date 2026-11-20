import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { appointmentsFor, isUpcoming, type Appointment } from "@/lib/records";
import PageHead from "../PageHead";
import { AppointmentForm } from "./AppointmentForm";

function Row({ a }: { a: Appointment }) {
  const date = new Date(`${a.date}T00:00:00`);
  return (
    <li>
      <Link href={`/appointments/${a.id}`} className="appt-row">
        <span className="appt-date">
          <strong>{date.getDate()}</strong>
          <small>{date.toLocaleDateString(undefined, { month: "short" })}</small>
        </span>
        <span>
          <strong>{a.title}</strong>
          <small>{a.type}{a.time ? ` · ${a.time}` : ""}{a.location ? ` · ${a.location}` : ""}</small>
        </span>
        <span className="appt-arrow">→</span>
      </Link>
    </li>
  );
}

export default async function AppointmentsPage() {
  const user = await requireUser();
  const all = await appointmentsFor(user.id);
  const upcoming = all.filter(isUpcoming);
  const past = all.filter((a) => !isUpcoming(a)).reverse();

  return (
    <>
      <PageHead eyebrow="APPOINTMENTS" title={<>Check-ups and scans, <em>in one place.</em></>} text="Only you can see your appointments." />
      <div className="section-wrap page-body appt-layout">
        <div>
          <h2 className="block-title">Upcoming</h2>
          {upcoming.length ? <ul className="appt-list">{upcoming.map((a) => <Row key={a.id} a={a} />)}</ul> : <p className="dash-empty">No upcoming appointments.</p>}
          {past.length > 0 && (
            <>
              <h2 className="block-title">Past</h2>
              <ul className="appt-list past">{past.map((a) => <Row key={a.id} a={a} />)}</ul>
            </>
          )}
        </div>
        <AppointmentForm />
      </div>
    </>
  );
}
