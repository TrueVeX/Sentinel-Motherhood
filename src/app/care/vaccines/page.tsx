"use client";

import { useEffect, useState } from "react";
import { load, save } from "@/lib/browser-storage";
import { downloadIcs, googleCalendarUrl, todayKey } from "@/lib/calendar";
import { useI18n } from "../../I18n";
import CareShell from "../CareShell";

// India's Universal Immunisation Programme (national schedule). Ages from the date of birth.
// JE is given only in districts where Japanese Encephalitis occurs.
const SCHEDULE: { age: string; days?: number; months?: number; vaccines: string }[] = [
  { age: "At birth", days: 0, vaccines: "BCG · OPV-0 · Hepatitis B (birth dose)" },
  { age: "6 weeks", days: 42, vaccines: "OPV-1 · Pentavalent-1 · Rotavirus-1 · fIPV-1 · PCV-1" },
  { age: "10 weeks", days: 70, vaccines: "OPV-2 · Pentavalent-2 · Rotavirus-2" },
  { age: "14 weeks", days: 98, vaccines: "OPV-3 · Pentavalent-3 · Rotavirus-3 · fIPV-2 · PCV-2" },
  { age: "9 months", months: 9, vaccines: "MR-1 · PCV booster · fIPV-3 · JE-1 (where given)" },
  { age: "16–24 months", months: 16, vaccines: "MR-2 · DPT booster-1 · OPV booster · JE-2 (where given)" },
  { age: "5–6 years", months: 60, vaccines: "DPT booster-2" },
  { age: "10 years", months: 120, vaccines: "Td" },
  { age: "16 years", months: 192, vaccines: "Td" }
];

function dueDate(dob: string, s: (typeof SCHEDULE)[number]) {
  const d = new Date(`${dob}T00:00:00`);
  if (s.days !== undefined) d.setDate(d.getDate() + s.days);
  if (s.months !== undefined) d.setMonth(d.getMonth() + s.months);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Baby's vaccinations by date, with "done" ticks and calendar reminders. */
export default function VaccinesPage() {
  const { t } = useI18n();
  const [dob, setDob] = useState("");
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    setDob(load<string>("sm-baby-dob", ""));
    setDone(load<string[]>("sm-vaccines-done", []));
  }, []);

  const changeDob = (v: string) => { setDob(v); save("sm-baby-dob", v); };
  const toggle = (age: string) => {
    const next = done.includes(age) ? done.filter((x) => x !== age) : [...done, age];
    setDone(next);
    save("sm-vaccines-done", next);
  };

  const today = todayKey();
  const rows = dob ? SCHEDULE.map((s) => ({ ...s, due: dueDate(dob, s) })) : [];
  const events = rows.filter((r) => !done.includes(r.age) && r.due >= today).map((r) => ({ title: `💉 Baby vaccines: ${r.vaccines}`, details: `Due at ${r.age}. Sentinel Motherhood reminder.`, date: r.due }));

  return (
    <CareShell titleKey="care.vaccines" icon="💉">
      <div className="tracker-card">
        <label className="field">
          <span>{t("vac.dob")}</span>
          <input type="date" value={dob} onChange={(e) => changeDob(e.target.value)} max={today} />
        </label>
        {rows.length > 0 && (
          <>
            <ol className="vac-list">
              {rows.map((r) => {
                const isDone = done.includes(r.age);
                const overdue = !isDone && r.due < today;
                return (
                  <li key={r.age} className={isDone ? "done" : overdue ? "overdue" : ""}>
                    <label className="vit-check">
                      <input type="checkbox" checked={isDone} onChange={() => toggle(r.age)} aria-label={`${t("vac.done")}: ${r.age}`} />
                      <span>
                        <strong>{r.age}</strong>
                        <small>{r.vaccines}</small>
                        <em>{isDone ? `✓ ${t("vac.done")}` : `${overdue ? `⚠ ${t("vac.overdue")}` : t("vac.due")}: ${new Date(`${r.due}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`}</em>
                      </span>
                    </label>
                    {!isDone && r.due >= today && (
                      <a className="vac-cal" href={googleCalendarUrl({ title: `💉 Baby vaccines: ${r.vaccines}`, details: `Due at ${r.age}.`, date: r.due })} target="_blank" rel="noopener noreferrer" aria-label="Add to Google Calendar">📅</a>
                    )}
                  </li>
                );
              })}
            </ol>
            {events.length > 0 && (
              <button type="button" className="button button-primary" onClick={() => downloadIcs("baby-vaccines.ics", events)}>📅 {t("vac.calendar")}</button>
            )}
          </>
        )}
        <small className="kit-muted">{t("vac.note")}</small>
      </div>
    </CareShell>
  );
}
