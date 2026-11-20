import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAppointment } from "@/lib/records";
import PageHead from "../../PageHead";
import { DeleteAppointmentButton } from "../AppointmentForm";

export default async function AppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const appt = await getAppointment(user.id, id);
  if (!appt) notFound();

  const date = new Date(`${appt.date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <>
      <PageHead eyebrow={appt.type.toUpperCase()} title={appt.title} crumbs={[{ href: "/appointments", label: "Appointments" }]} />
      <div className="section-wrap page-body narrow">
        <dl className="detail-list">
          <div><dt>Date</dt><dd>{date}</dd></div>
          <div><dt>Time</dt><dd>{appt.time || "Not set"}</dd></div>
          <div><dt>Where</dt><dd>{appt.location || "Not set"}</dd></div>
          <div><dt>Notes</dt><dd className="pre">{appt.notes || "No notes yet."}</dd></div>
        </dl>
        <div className="form-buttons">
          <Link className="text-link" href="/appointments">← All appointments</Link>
          {appt.location && (
            <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appt.location)}`} target="_blank" rel="noopener noreferrer">
              Open in maps ↗
            </a>
          )}
          <DeleteAppointmentButton id={appt.id} />
        </div>
      </div>
    </>
  );
}
