"use client";

import { useActionState, useTransition } from "react";
import { createAppointment, removeAppointment } from "../actions/records";

const TYPES = ["Check-up", "Scan", "Blood test", "Vaccination", "Class", "Other"];

export function AppointmentForm() {
  const [state, action, pending] = useActionState(createAppointment, undefined);
  return (
    <form action={action} className="form-card">
      <h2>Add an appointment</h2>
      <label className="field"><span>What is it?</span><input name="title" required maxLength={100} placeholder="e.g. 20-week scan" /></label>
      <label className="field">
        <span>Type</span>
        <select name="type" defaultValue="Check-up">{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
      </label>
      <div className="field-row">
        <label className="field"><span>Date</span><input name="date" type="date" required /></label>
        <label className="field"><span>Time</span><input name="time" type="time" /></label>
      </div>
      <label className="field"><span>Where</span><input name="location" maxLength={120} placeholder="Clinic or hospital name" /></label>
      <label className="field"><span>Notes and questions to ask</span><textarea name="notes" rows={3} maxLength={1000} /></label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="button button-primary" disabled={pending}>{pending ? "Saving…" : "Save appointment"}</button>
    </form>
  );
}

export function DeleteAppointmentButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="danger-button"
      disabled={pending}
      onClick={() => {
        if (window.confirm("Delete this appointment?")) start(() => removeAppointment(id));
      }}
    >
      {pending ? "Deleting…" : "Delete appointment"}
    </button>
  );
}
