"use client";

import { useActionState } from "react";
import { changePassword, deleteAccount, saveProfile, sendContact } from "./actions/records";

function Status({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (state?.error) return <p className="form-error" role="alert">{state.error}</p>;
  if (state?.ok) return <p className="form-ok" role="status">{state.ok}</p>;
  return null;
}

export function ProfileForm(props: { name: string; email: string; role: string; journey: string; dueDate: string; babyBirthDate: string }) {
  const [state, action, pending] = useActionState(saveProfile, undefined);
  return (
    <form action={action} className="form-card wide">
      <label className="field"><span>Name</span><input name="name" defaultValue={props.name} required maxLength={60} /></label>
      <label className="field"><span>Email</span><input value={props.email} disabled /></label>
      {props.role === "mother" && (
        <>
          <label className="field">
            <span>Journey</span>
            <select name="journey" defaultValue={props.journey}>
              <option value="pregnancy">Pregnancy journey</option>
              <option value="birth">Birth journey</option>
              <option value="motherhood">Motherhood journey</option>
            </select>
          </label>
          <div className="field-row">
            <label className="field"><span>Due date</span><input name="dueDate" type="date" defaultValue={props.dueDate} /></label>
            <label className="field"><span>Baby’s birth date</span><input name="babyBirthDate" type="date" defaultValue={props.babyBirthDate} /></label>
          </div>
        </>
      )}
      <Status state={state} />
      <button className="button button-primary" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
    </form>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="form-card wide">
      <h2>{hasPassword ? "Change password" : "Set a password"}</h2>
      {!hasPassword && <p>You signed up with Google or Apple. Set a password if you’d also like to log in with your email.</p>}
      {hasPassword && (
        <label className="field"><span>Current password</span><input name="current" type="password" autoComplete="current-password" required /></label>
      )}
      <label className="field"><span>New password (at least 8 characters)</span><input name="next" type="password" autoComplete="new-password" minLength={8} required /></label>
      <Status state={state} />
      <button className="button button-primary" disabled={pending}>{pending ? "Saving…" : hasPassword ? "Change password" : "Set password"}</button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, undefined);
  return (
    <form action={action} className="form-card wide danger-zone">
      <h2>Delete my account</h2>
      <p>This permanently deletes your account, journal and appointments. Type <strong>DELETE</strong> to confirm.</p>
      <label className="field"><span>Confirm</span><input name="confirm" autoComplete="off" /></label>
      <Status state={state} />
      <button className="danger-button" disabled={pending}>{pending ? "Deleting…" : "Delete my account"}</button>
    </form>
  );
}

export function ContactForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(sendContact, undefined);
  return (
    <form action={action} className="form-card wide">
      <div className="field-row">
        <label className="field"><span>Name</span><input name="name" defaultValue={name} required maxLength={60} /></label>
        <label className="field"><span>Email</span><input name="email" type="email" defaultValue={email} required /></label>
      </div>
      <label className="field"><span>Message</span><textarea name="message" rows={6} maxLength={2000} required /></label>
      <Status state={state} />
      <button className="button button-primary" disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}
