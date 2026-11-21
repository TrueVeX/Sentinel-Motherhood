"use client";

import { useEffect, useState } from "react";
import { load, save } from "@/lib/browser-storage";
import { useI18n } from "../../I18n";
import CareShell from "../CareShell";

type Session = { start: number; kicks: number[]; end: number | null };
const KEY = "sm-kicks";
const mins = (ms: number) => `${Math.floor(ms / 60000)} min ${Math.round((ms % 60000) / 1000)} s`;

/** Kick counter: tap for each movement; shows the time taken to reach 10. */
export default function KicksPage() {
  const { t } = useI18n();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setSessions(load<Session[]>(KEY, []));
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const current = sessions.length && sessions[sessions.length - 1].end === null ? sessions[sessions.length - 1] : null;
  const update = (next: Session[]) => {
    setSessions(next.slice(-30));
    save(KEY, next.slice(-30));
  };

  const start = () => update([...sessions, { start: Date.now(), kicks: [], end: null }]);
  const kick = () => {
    if (!current) return;
    if ("vibrate" in navigator) navigator.vibrate?.(30);
    update(sessions.map((s) => (s === current ? { ...s, kicks: [...s.kicks, Date.now()] } : s)));
  };
  const finish = () => update(sessions.map((s) => (s === current ? { ...s, end: Date.now() } : s)));

  const tenth = (s: Session) => (s.kicks.length >= 10 ? s.kicks[9] - s.start : null);

  return (
    <CareShell titleKey="care.kicks" icon="👣">
      {current ? (
        <div className="tracker-card center">
          <button type="button" className="big-tap" onClick={kick}>
            <span className="big-count">{current.kicks.length}</span>
            {t("kicks.tap")}
          </button>
          <p className="tracker-meta">⏱ {mins(now - current.start)}</p>
          {tenth(current) !== null && <p className="form-ok">✓ {t("kicks.reached")} {mins(tenth(current)!)}</p>}
          <button type="button" className="button button-primary" onClick={finish}>{t("kicks.finish")}</button>
        </div>
      ) : (
        <div className="tracker-card center">
          <button type="button" className="big-tap" onClick={start}>👣 {t("kicks.start")}</button>
        </div>
      )}
      <p className="tracker-warning">⚠ {t("kicks.note")}</p>

      {sessions.some((s) => s.end) && (
        <div className="tracker-card">
          <h2>{t("kicks.history")}</h2>
          <ul className="tracker-list">
            {sessions.filter((s) => s.end).slice(-10).reverse().map((s) => (
              <li key={s.start}>
                <span>{new Date(s.start).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                <strong>{s.kicks.length} 👣</strong>
                <span>{tenth(s) !== null ? `10 → ${mins(tenth(s)!)}` : mins((s.end ?? s.start) - s.start)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CareShell>
  );
}
