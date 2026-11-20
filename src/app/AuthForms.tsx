"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { completeOnboarding, login, signup } from "./actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="form-card">
      <input type="hidden" name="next" value={next} />
      <label className="field"><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
      <label className="field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="button button-primary" disabled={pending}>{pending ? "Logging in…" : "Log in"}</button>
      <p className="form-switch">New here? <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link></p>
    </form>
  );
}

export function SignupForm({ journey }: { journey: string }) {
  const [state, action, pending] = useActionState(signup, undefined);
  return (
    <form action={action} className="form-card">
      <input type="hidden" name="journey" value={journey} />
      <label className="field"><span>Your name</span><input name="name" autoComplete="name" required maxLength={60} /></label>
      <label className="field"><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
      <label className="field"><span>Password (at least 8 characters)</span><input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
      <fieldset className="role-pick">
        <legend>I am…</legend>
        <label><input type="radio" name="role" value="mother" defaultChecked /> A mother or family member</label>
        <label><input type="radio" name="role" value="professional" /> A healthcare professional</label>
      </fieldset>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="button button-primary" disabled={pending}>{pending ? "Creating account…" : "Create account"}</button>
      <p className="form-switch">Already have an account? <Link href="/login">Log in</Link></p>
    </form>
  );
}

const JOURNEY_OPTIONS = [
  { key: "pregnancy", icon: "✳", title: "Pregnancy", text: "Tracking, baby development and milestones." },
  { key: "birth", icon: "⌂", title: "Birth", text: "Delivery prep, hospital checklist and appointments." },
  { key: "motherhood", icon: "☼", title: "Motherhood", text: "Newborn care, feeding and baby milestones." }
];

export function OnboardingForm({
  name,
  role,
  journey,
  dueDate,
  babyBirthDate
}: {
  name: string;
  role: string;
  journey: string;
  dueDate: string;
  babyBirthDate: string;
}) {
  const [state, action, pending] = useActionState(completeOnboarding, undefined);
  const [step, setStep] = useState(1);
  const [picked, setPicked] = useState(journey);
  const isProfessional = role !== "mother";

  return (
    <form action={action} className="form-card wide">
      <ol className="steps" aria-label="Setup steps">
        <li className={step === 1 ? "current" : "done"}>1. Profile setup</li>
        {!isProfessional && <li className={step === 2 ? "current" : ""}>2. Choose your journey</li>}
      </ol>

      <div hidden={step !== 1}>
        <label className="field"><span>Your name</span><input name="name" defaultValue={name} required maxLength={60} /></label>
        {!isProfessional && (
          <div className="field-row">
            <label className="field"><span>Due date (if pregnant)</span><input name="dueDate" type="date" defaultValue={dueDate} /></label>
            <label className="field"><span>Baby’s birth date (if born)</span><input name="babyBirthDate" type="date" defaultValue={babyBirthDate} /></label>
          </div>
        )}
        {isProfessional ? (
          <button className="button button-primary" disabled={pending}>{pending ? "Saving…" : "Go to my dashboard"}</button>
        ) : (
          <button type="button" className="button button-primary" onClick={() => setStep(2)}>Next <span>→</span></button>
        )}
      </div>

      {!isProfessional && (
        <div hidden={step !== 2}>
          <div className="journey-pick" role="radiogroup" aria-label="Your journey">
            {JOURNEY_OPTIONS.map((j) => (
              <label key={j.key} className={picked === j.key ? "journey-option chosen" : "journey-option"}>
                <input type="radio" name="journey" value={j.key} checked={picked === j.key} onChange={() => setPicked(j.key)} />
                <span className="stage-icon">{j.icon}</span>
                <strong>{j.title}</strong>
                <small>{j.text}</small>
              </label>
            ))}
          </div>
          <div className="form-buttons">
            <button type="button" className="text-link" onClick={() => setStep(1)}>← Back</button>
            <button className="button button-primary" disabled={pending || !picked}>{pending ? "Saving…" : "Go to my dashboard"} <span>→</span></button>
          </div>
        </div>
      )}
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
    </form>
  );
}
