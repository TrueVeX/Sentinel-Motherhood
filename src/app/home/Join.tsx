"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { load, save } from "@/lib/browser-storage";
import { useReveals } from "./hooks";

const DAY = 86400000;

/** The due date saved by the week tracker tool (it stores either a due date or a period date). */
function savedDueDate(): string {
  const stored = load<{ mode: "lmp" | "due"; value: string } | null>("sm-tracker", null);
  if (!stored?.value) return "";
  if (stored.mode === "due") return stored.value;
  const [y, m, d] = stored.value.split("-").map(Number);
  if (!y || !m || !d) return "";
  const due = new Date(new Date(y, m - 1, d).getTime() + 280 * DAY);
  return `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`;
}

function useCountdown(date: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const [y, m, d] = date.split("-").map(Number);
  const target = y && m && d ? new Date(y, m - 1, d).getTime() : now;
  const ms = Math.max(0, target - now);
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, done: !!date && ms === 0 };
}

/** Due-date countdown on one side, joining Sentinel on the other. */
export default function Join({ signedIn }: { signedIn: boolean }) {
  const ref = useReveals<HTMLElement>();
  const [due, setDue] = useState("");
  const t = useCountdown(due);

  useEffect(() => setDue(savedDueDate()), []);

  function changeDue(value: string) {
    setDue(value);
    if (value) save("sm-tracker", { mode: "due", value });
  }

  const units: [string, number][] = [
    ["Days", t.d],
    ["Hrs", t.h],
    ["Min", t.m],
    ["Sec", t.s]
  ];

  return (
    <section ref={ref} id="start" className="ld-join" aria-labelledby="join-title">
      <div aria-hidden="true" className="ld-join-glow" />

      <div className="ld-join-grid">
        <div data-reveal>
          <p className="ld-label ld-teal">Countdown</p>
          <h2 id="join-title" className="ld-display ld-deep">Counting down to <em>the big day.</em></h2>
          <p className="ld-body ld-muted-text">Add your due date and watch the countdown. It’s saved on this device, together with the week tracker.</p>

          <label className="ld-due">
            <span className="ld-label ld-muted">Your due date</span>
            <input type="date" value={due} onChange={(e) => changeDue(e.target.value)} />
          </label>

          <div className="ld-count" role="timer" aria-label={due ? `${t.d} days, ${t.h} hours and ${t.m} minutes until your due date` : "Add your due date to start the countdown"}>
            {units.map(([label, v]) => (
              <div key={label} className="ld-brackets-box">
                <span className="ld-count-num">{String(v).padStart(2, "0")}</span>
                <span className="ld-label ld-muted">{label}</span>
              </div>
            ))}
          </div>
          {t.done && <p className="ld-body ld-teal">Your due date is here. Wishing you all the best!</p>}
        </div>

        <div className="ld-join-card" data-reveal>
          <p className="ld-label ld-teal">Join Sentinel</p>
          <h3>Your journey starts here.</h3>
          <p className="ld-body ld-muted-text">Create a free account, choose your journey and go straight to your own dashboard. Your journal, appointments and dashboard are private to you.</p>
          {signedIn ? (
            <Link href="/dashboard" className="ld-btn">Go to my dashboard</Link>
          ) : (
            <div className="ld-join-buttons">
              <Link href="/signup" className="ld-btn">Create a free account</Link>
              <Link href="/login" className="ld-btn ghost">Log in</Link>
            </div>
          )}
          <div className="ld-join-links">
            <Link href="/ai-assistant">Ask the AI assistant ↗</Link>
            <Link href="/tools">Explore the tools ↗</Link>
            <Link href="/emergency" className="ld-emergency">Emergency help ↗</Link>
          </div>
        </div>
      </div>

      <p className="ld-closing" data-reveal>
        Guiding motherhood, <em>nurturing generations.</em>
      </p>
    </section>
  );
}
