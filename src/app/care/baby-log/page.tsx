"use client";

import { useEffect, useState } from "react";
import { load, save } from "@/lib/browser-storage";
import { useI18n } from "../../I18n";
import CareShell from "../CareShell";

type Kind = "feed" | "wet" | "dirty" | "sleepStart" | "sleepEnd";
type Entry = { id: string; kind: Kind; at: number };
const KEY = "sm-baby-log";
const BUTTONS: { kind: Kind; icon: string; label: string }[] = [
  { kind: "feed", icon: "🍼", label: "log.feed" },
  { kind: "wet", icon: "💧", label: "log.wet" },
  { kind: "dirty", icon: "💩", label: "log.dirty" }
];
const ICON: Record<Kind, string> = { feed: "🍼", wet: "💧", dirty: "💩", sleepStart: "😴", sleepEnd: "🌞" };
const time = (ms: number) => new Date(ms).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

/** One-tap log of feeds, nappies and sleep, with today's totals. */
export default function BabyLogPage() {
  const { t } = useI18n();
  const [log, setLog] = useState<Entry[]>([]);

  useEffect(() => setLog(load<Entry[]>(KEY, [])), []);

  const update = (next: Entry[]) => {
    const trimmed = next.slice(-500);
    setLog(trimmed);
    save(KEY, trimmed);
  };
  const add = (kind: Kind) => {
    if ("vibrate" in navigator) navigator.vibrate?.(25);
    update([...log, { id: crypto.randomUUID(), kind, at: Date.now() }]);
  };

  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const today = log.filter((e) => e.at >= startOfToday);
  const count = (k: Kind) => today.filter((e) => e.kind === k).length;
  const lastSleep = [...log].reverse().find((e) => e.kind === "sleepStart" || e.kind === "sleepEnd");
  const sleeping = lastSleep?.kind === "sleepStart";

  return (
    <CareShell titleKey="care.babyLog" icon="🍼">
      <div className="log-buttons">
        {BUTTONS.map((b) => (
          <button type="button" key={b.kind} onClick={() => add(b.kind)}>
            <span>{b.icon}</span>
            {t(b.label)}
          </button>
        ))}
        <button type="button" className={sleeping ? "sleeping" : ""} onClick={() => add(sleeping ? "sleepEnd" : "sleepStart")}>
          <span>{sleeping ? "🌞" : "😴"}</span>
          {sleeping ? t("log.sleepEnd") : t("log.sleepStart")}
        </button>
      </div>
      {sleeping && lastSleep && <p className="form-ok">😴 {t("log.sleeping")} {time(lastSleep.at)}</p>}

      <div className="tracker-card">
        <h2>{t("log.today")}</h2>
        <div className="log-totals">
          <div><strong>{count("feed")}</strong><small>🍼 {t("log.feed")}</small></div>
          <div><strong>{count("wet")}</strong><small>💧 {t("log.wet")}</small></div>
          <div><strong>{count("dirty")}</strong><small>💩 {t("log.dirty")}</small></div>
        </div>
      </div>

      {log.length > 0 && (
        <div className="tracker-card">
          <h2>{t("log.recent")}</h2>
          <ul className="tracker-list">
            {[...log].reverse().slice(0, 20).map((e) => (
              <li key={e.id}>
                <span>{new Date(e.at).toLocaleDateString(undefined, { day: "numeric", month: "short" })} {time(e.at)}</span>
                <strong>{ICON[e.kind]} {t(e.kind === "sleepStart" ? "log.sleepStart" : e.kind === "sleepEnd" ? "log.sleepEnd" : `log.${e.kind}`)}</strong>
                <button type="button" className="kit-remove" onClick={() => update(log.filter((x) => x.id !== e.id))} aria-label={t("kit.remove")}>×</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CareShell>
  );
}
