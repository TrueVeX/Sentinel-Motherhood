"use client";

import { useEffect, useState } from "react";
import { load, save } from "@/lib/browser-storage";
import { numbersFor } from "@/lib/emergency-numbers";
import { loadCard, savedCountry, telHref } from "@/lib/kit";
import { useI18n } from "../../I18n";
import SosShare from "../SosShare";

type Contraction = { start: number; end: number | null };
const KEY = "sm-contractions";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/**
 * Labour mode: one big button to time contractions, with how long they last and how far apart
 * they are. When they are about 5 minutes apart and about a minute long, it says to contact the
 * hospital. Quick buttons call the hospital, call emergency services, or share your location.
 */
export default function LabourMode() {
  const { t } = useI18n();
  const [list, setList] = useState<Contraction[]>([]);
  const [now, setNow] = useState(Date.now());
  const [hospitalPhone, setHospitalPhone] = useState("");
  const [emergency, setEmergency] = useState("112");

  useEffect(() => {
    setList(load<Contraction[]>(KEY, []));
    setHospitalPhone(loadCard().hospitalPhone);
    setEmergency(numbersFor(savedCountry()).info.main.number);
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const running = list.length > 0 && list[list.length - 1].end === null;

  function toggle() {
    const next = running
      ? list.map((c, i) => (i === list.length - 1 ? { ...c, end: Date.now() } : c))
      : [...list, { start: Date.now(), end: null }].slice(-60);
    setList(next);
    save(KEY, next);
    if ("vibrate" in navigator) navigator.vibrate?.(40);
  }

  function clear() {
    setList([]);
    save(KEY, []);
  }

  const done = list.filter((c) => c.end !== null) as { start: number; end: number }[];
  const recent = done.slice(-4);
  const durations = recent.map((c) => c.end - c.start);
  const intervals = recent.slice(1).map((c, i) => c.start - recent[i].start);
  const lastHour = done.filter((c) => now - c.start < 3600_000).length;
  // "5-1-1" style guidance: about 5 minutes apart, lasting about a minute.
  const goTime = intervals.length >= 3 && avg(intervals) <= 5.5 * 60_000 && avg(durations) >= 45_000;

  return (
    <div className="labour">
      <button type="button" className={running ? "labour-button running" : "labour-button"} onClick={toggle} aria-pressed={running}>
        {running ? (
          <>
            <span className="labour-time">{mmss(now - list[list.length - 1].start)}</span>
            {t("labour.stop")}
          </>
        ) : (
          t("labour.start")
        )}
      </button>

      <div className="labour-stats">
        <div><strong>{durations.length ? mmss(avg(durations)) : "–"}</strong><small>{t("labour.duration")}</small></div>
        <div><strong>{intervals.length ? mmss(avg(intervals)) : "–"}</strong><small>{t("labour.apart")}</small></div>
        <div><strong>{lastHour}</strong><small>{t("labour.count")}</small></div>
      </div>

      <p className={goTime ? "labour-advice go" : "labour-advice"} role="status">{goTime ? t("labour.adviceGo") : t("labour.adviceWatch")}</p>
      <p className="labour-urgent">⚠ {t("labour.urgent")}</p>

      <div className="labour-actions">
        {hospitalPhone ? (
          <a href={telHref(hospitalPhone)} className="call-button big">🏥 {t("labour.callHospital")}</a>
        ) : (
          <a href="/emergency/card" className="labour-missing">{t("labour.noHospital")}</a>
        )}
        <a href={`tel:${emergency}`} className="call-112">📞 {t("labour.callEmergency")} ({emergency})</a>
      </div>
      <SosShare compact />

      {done.length > 0 && (
        <div className="labour-history">
          <div className="form-buttons">
            <h3>{t("labour.history")}</h3>
            <button type="button" className="link-button" onClick={clear}>{t("labour.clear")}</button>
          </div>
          <ol>
            {done.slice(-8).reverse().map((c, i, arr) => {
              const prev = arr[i + 1];
              return (
                <li key={c.start}>
                  <span>{new Date(c.start).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                  <span>{t("labour.duration")} {mmss(c.end - c.start)}</span>
                  <span>{prev ? `${t("labour.apart")} ${mmss(c.start - prev.start)}` : ""}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
